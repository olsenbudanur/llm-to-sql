//
// For validating SQL. A little heavy, but it works.
import { Parser } from 'node-sql-parser';
//
// ORM for executing SQL queries
import { Sequelize } from "sequelize";
//
// LLM API for interfacing with the LLM model
import { OpenAIChatApi } from "llm-api"
//
// Internal types for the LLMToSQL class
import {
  LLMToSQLResponse 
} from "./utils/types"
//
// The prompts/queries
import {
  systemPrompt,
  userMessage,
  databaseStructureGetterSQL
} from "./utils/prompts"

/**
 * This is a template for a class that converts LLM output to SQL queries.
 */
export class LLMToSQL {
    /**
     * The maximum number of trials to auto-heal the LLM model.
     */
    public MAX_TRIALS = 5;

    /**
     * The LLM interface to use. 
     * Using llm-api to make it easier to switch between different LLM models.
     */
    private llmApi: OpenAIChatApi;
    /**
     * Using sequelize as ORM if user wants to execute SQL queries.
     */
    private sequelizeORM: Sequelize | undefined;

    /**
     * The system prompt to use for the LLM model.
     * Default is the system prompt provided in the types file.
     */
    private systemPrompt: string = systemPrompt

    /**
     * This is the SQL schema user might provide to help the LLM model.
     * This is required if the user is not using an ORM.
     */
    private userProvidedSqlInformation: string | undefined = undefined;

    /**
     * The constructor for the LLMToSQL class.
     * 
     * @param llmApi the LLM interface to use
     * @param sequelize the ORM to use
     * @param sqlInfo SQL information if ORM is not provided
     */
    constructor(llmApi: OpenAIChatApi, sequelize: Sequelize | undefined, sqlInfo: string | undefined) {
      //
      // If user provides sequelize, they should not provide SQL information and vice versa
      if ((sequelize === undefined && sqlInfo === undefined) || (sequelize !== undefined && sqlInfo !== undefined)) {
        throw new Error("Either an ORM or SQL information must be provided, but not both.");
      }

      this.sequelizeORM = sequelize;
      this.userProvidedSqlInformation = sqlInfo;
      this.llmApi = llmApi;
    }

    /**
     * This is a method to change the system prompt, gives users
     * the ability to change the system prompt for LLM customizability.
     * 
     * @param newSystemMessage the new system message to use
     */
    public changeSystemPrompt(newSystemMessage: string): void {
      this.systemPrompt = newSystemMessage;
    }

    /**
     * This is a method to change the maximum number of trials to auto-heal the LLM model.
     * 
     * @param newMaxTrials the new maximum number of trials to auto-heal the LLM model
     */
    public changeMaxTrials(newMaxTrials: number): void {
      this.MAX_TRIALS = newMaxTrials;
    }

    /**
     * This is the main method to run the LLM model and convert the user query to SQL.
     * 
     * @param userQuery the user query to convert to SQL
     * @returns the SQL query as a string or the results of the SQL query if an ORM is provided
     */
    public async run(userQuery: string, execute: boolean = false): Promise<LLMToSQLResponse> {
      //
      // 1- Verify the database information
      if (!await this.validateDatabaseInformation()) {
        throw new Error("Database information validation failed.");
      }

      //
      // 2- Create the user message
      const message = userMessage.replace(
        "{structure}", 
        this.userProvidedSqlInformation!
      ).replace(
        "{userQuery}", 
        userQuery
      );

      //
      // 3- Get the LLM model response. Auto-heal for MAX_TRIALS if the response is invalid.
      let response = await this.llmApi.textCompletion(message, {systemMessage: this.systemPrompt});
      let trials = 0;
      let newMessage = "";
      while (!this.isValidSQL(response.content!) && trials < this.MAX_TRIALS) {
        newMessage = message + "Last iteration, you provided: " + response.content + " which is not a valid SQL query. Please provide a valid SQL query.";
        response = await this.llmApi.textCompletion(newMessage, {systemMessage: this.systemPrompt});
        trials++;
      }

      //
      // If LLM did not return anything, throw an error
      if (response.content === undefined) {
        throw new Error("The LLM model was unable to respond.");
      }
      
      //
      // If the response is still invalid, throw an error
      if (!this.isValidSQL(response.content!)) {
        throw new Error("The LLM model was unable to generate a valid SQL query.");
      }

      //
      // 4- If user defined an ORM, and has execute on, try to execute the SQL query
      // else, just return the SQL query
      let result: LLMToSQLResponse = {
        sqlQuery: response.content!
      }

      if (this.sequelizeORM !== undefined && execute) {
        try {
          let sqlResponse = await this.sequelizeORM.query(response.content!);
          result = {
            sqlQuery: response.content!,
            results: sqlResponse
          }
        }
        catch (error) {
          console.error("Error executing SQL query:", error);
        }
      }
      return result
    }

    //
    // HELPER FUNCTIONS
    //
    
    /**
     * This is a helper function to delay the execution of the program.
     * 
     * @param ms delay in milliseconds
     * @returns a promise that resolves after the delay
     */
    private delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }

    /**
     * This is a helper function to validate the database information.
     * The user must provide either an ORM or SQL schema information.
     * 
     * @returns true if the database information is valid, false otherwise
     */
    private async validateDatabaseInformation(): Promise<boolean> {
      //
      // First, verify the database information
      if (this.sequelizeORM === undefined) {
        //
        // If the user did not provide an ORM, they must provide SQL information
        if (this.userProvidedSqlInformation === undefined) {
          throw new Error("SQL information must be provided if ORM is not provided.");
        }
      } else {
        //
        // Connect to the database
        try {
          await this.sequelizeORM.authenticate();
          const userDatabase = await this.sequelizeORM.getDatabaseName();
          const schemaGetterSQL = databaseStructureGetterSQL.replace("{database}", userDatabase);
    
          //
          // Get the database information
          await this.delay(500);
          const databaseInfo = await this.sequelizeORM.query(schemaGetterSQL);
          this.userProvidedSqlInformation = JSON.stringify(databaseInfo);
        } catch (error) {
          console.error("Error validating database information:", error);
          return false;
        }
      }
      return true;
    }

    /**
     * This is a method to validate an SQL query.
     * Used for auto-healing if llm model provides an invalid SQL query.
     * 
     * @param sqlQuery the SQL query to validate
     * @returns true if the SQL query is valid, false otherwise
     */
    private isValidSQL(sqlQuery: string): boolean {
      const parser = new Parser();
      try {
        parser.astify(sqlQuery);
      } catch (error) {
        return false;
      }
      return true;
    }
}
  