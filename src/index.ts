import { Parser } from 'node-sql-parser';
import { Sequelize, QueryTypes } from "sequelize";
import { OpenAIChatApi } from "llm-api"


import { systemPrompt, databaseStructureGetterSQL, userMessage } from "./types"

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
    changeSystemPrompt(newSystemMessage: string): void {
      this.systemPrompt = newSystemMessage;
    }

    /**
     * This is a method to validate an SQL query.
     * Used for auto-healing if llm model provides an invalid SQL query.
     * 
     * @param sqlQuery the SQL query to validate
     * @returns true if the SQL query is valid, false otherwise
     */
    isValidSQL(sqlQuery: string): boolean {
      const parser = new Parser();
      try {
        parser.astify(sqlQuery);
      } catch (error) {
        return false;
      }
      return true;
    }

    formatResults(results: any[]) {
      return results.map(row => Object.values(row).join(' | '));
    }

    async validateDatabaseInformation(): Promise<boolean> {
      console.log("validating database information...");
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
     * This is a helper function to delay the execution of the program.
     * 
     * @param ms delay in milliseconds
     * @returns a promise that resolves after the delay
     */
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
  
    async run(userQuery: string): Promise<string> {
      //
      // 1- Verify the database information
      if (!await this.validateDatabaseInformation()) {
        throw new Error("Database information validation failed.");
      }
      console.log("database info: ", this.userProvidedSqlInformation)

      //
      // 2- Create the user message
      const message = userMessage.replace(
        "{structure}", 
        this.userProvidedSqlInformation!
      ).replace(
        "{userQuery}", 
        userQuery
      );

      console.log("user message: ", message)

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

      console.log("llm response: ", response.content)

      //
      // If the response is still invalid, throw an error
      if (!this.isValidSQL(response.content!)) {
        throw new Error("The LLM model was unable to generate a valid SQL query.");
      }

      //
      // 4- If user defined an ORM, try to execute the SQL query and return the results as a string
      // else, return the SQL query
      if (this.sequelizeORM !== undefined) {
        // return response.content!;
        const [results, metadata] = await this.sequelizeORM.query(response.content!);
        console.log("formatted results: ", this.formatResults(results));
        console.log("metadata: ", metadata)
        return JSON.stringify(results);
      }
      else {
        return response.content!;
      }
    }

  }
  