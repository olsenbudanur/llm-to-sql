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
  LLMToSQLResponse,
  LLMToSQLArgs
} from "./utils/types"
//
// The prompts/queries
import {
  systemPrompt,
  userMessage,
  databaseStructureGetterSQL
} from "./utils/prompts"

//
// Create unit tests for the LLMToSQL class using mocking libraries like jest-mock-extended.

/**
 * This is a template for a class that converts LLM output to SQL queries.
 */
export class LLMToSQL {
    /**
     * The maximum number of trials to auto-heal the LLM model.
     */
    private MAX_TRIALS = 10;

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
     * This is the constructor for the LLMToSQL class. There are a few ways to initialize the class:
     * 
     * 1- Provide an instance of the LLM API and an instance of the ORM.
     * 2- Provide an instance of the LLM API and the configuration for the ORM.
     * 3- Provide an instance of the LLM API and the SQL schema information.
     * 4- Provide the configuration for the LLM API and an instance of the ORM.
     * 5- Provide the configuration for the LLM API and the configuration for the ORM.
     * 6- Provide the configuration for the LLM API and the SQL schema information.
     * 
     * //
     * // Args destructured
     * @param llmApi the LLM API instance to use (Either this or llmApiConfig and llmApiModelConfig must be provided)
     * @param llmApiConfig the LLM API configuration to use (Either this or llmApi must be provided)
     * @param llmApiModelConfig the LLM API model configuration to use (Either this or llmApi must be provided)
     * @param sequelize the ORM instance to use (Either this or sequelizeOptions must be provided)
     * @param sequelizeOptions the ORM configuration to use (Either this or sequelize must be provided)
     * @param sqlInfo the SQL schema information to use (Either this or sequelize must be provided)
     */
    constructor(args: LLMToSQLArgs) {
      //
      // Destructure the arguments
      const {
        llmApi,
        llmApiConfig,
        llmApiModelConfig,
        sequelize,
        sequelizeOptions,
        sqlInfo
      } = args;

      //
      // Either an sequelize, sequelizeOptions or sqlInfo must be provided, but not multiple or none.
      // throw out an error if this condition is not met.
      if ((sequelize === undefined && sequelizeOptions === undefined && sqlInfo === undefined) ||
          (sequelize !== undefined && sequelizeOptions !== undefined) ||
          (sequelize !== undefined && sqlInfo !== undefined) ||
          (sequelizeOptions !== undefined && sqlInfo !== undefined)) {
        throw new Error("Either an ORM instance, ORM configs or SQL information must be provided.");
      }

      //
      // If user provides llmApi configs, we create an instance of llmApi using those configs
      // else we use the llmApi instance provided by the user.
      // If user provided both, or neither, throw an error.
      if (llmApi === undefined && (llmApiConfig === undefined || llmApiModelConfig === undefined)) {
        throw new Error("Either an llmApi instance or llmApi configs must be provided.");
      } else if (llmApi === undefined) {
        this.llmApi = new OpenAIChatApi(llmApiConfig!, llmApiModelConfig!);
      } else {
        this.llmApi = llmApi;
      }

      //
      // Likewise, if user provides sequelize configs, we create an instance of sequelize using those configs
      // else we use the sequelize instance provided by the user.
      // We've already checked for the conditions where both, neither or multiple are provided.
      if (sequelizeOptions !== undefined) {
        this.sequelizeORM = new Sequelize(sequelizeOptions);
      }
      else if (sequelize !== undefined) {
        this.sequelizeORM = sequelize;
      }
      else {
        this.userProvidedSqlInformation = sqlInfo;
      }
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
          console.log("SQL query executed successfully.");
          console.log("Results:", sqlResponse);
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
      if (this.userProvidedSqlInformation !== undefined) return true;
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
  