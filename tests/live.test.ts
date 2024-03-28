import { LLMToSQL } from '../src/llm-to-sql';
import { OpenAIChatApi } from 'llm-api';
import { Options, Sequelize } from 'sequelize';
import { databseDescriptionFixture } from './fixtures/database-fixture';

//
// Before every test, set up the api key.
beforeAll(() => {
  process.env.OPENAI_API_KEY = '';
});

test.skip('Live test, initiating the instances manually.', async () => {
  const llmApiObj = new OpenAIChatApi({
    apiKey: process.env.OPENAI_API_KEY,
  }, {
    maxTokens: 1000,
    temperature: 0.5,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    model: 'gpt-3.5-turbo',
  });

  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'TestIC',
  });

  const llmToSQL = new LLMToSQL(llmApiObj, undefined, undefined, sequelize, undefined, undefined);
  
  //
  // This will execute the query and return the results.
  let response = await llmToSQL.run("Can you get all the instructors names?", true);
  console.log("SQL Query: ", response.sqlQuery);
  console.log("Results: ", response.sqlQuery);

  //
  // This will only return the SQL query.
  response = await llmToSQL.run("Can you get all the instructors names?");
  console.log("SQL Query: ", response.sqlQuery);
});

test.skip('Live test, passing the configs of both sql and llm.', async () => {
  let llmConfig = {
    apiKey: process.env.OPENAI_API_KEY,
  };

  let llmModelConfig = {
    model: 'gpt-3.5-turbo',
  }

  let sqlConfig = {
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'TestIC',
  } as Options

  const llmToSQL = new LLMToSQL(undefined, llmConfig, llmModelConfig, undefined, sqlConfig, undefined);

  //
  // This will execute the query and return the results.
  let response = await llmToSQL.run("Can you get all the instructors names?", true);
  console.log("SQL Query: ", response.sqlQuery);
  console.log("Results: ", response.results);

  //
  // This will only return the SQL query.
  response = await llmToSQL.run("Can you get all the instructors names?");
  console.log("SQL Query: ", response.sqlQuery);
});


test.skip('Live test, passing only the llm configs, and a description of the database', async () => {
  let llmConfig = {
    apiKey: process.env.OPENAI_API_KEY,
  };

  let llmModelConfig = {
    model: 'gpt-3.5-turbo',
  }

  //
  // The description can be natural language description of the database.
  let databaseDescription = "a single table called instructors the following columns: id, name, email, phone, address, city, state, zip, country, and date_of_birth. The table name is 'instructors'."
  const llmToSQL = new LLMToSQL(undefined, llmConfig, llmModelConfig, undefined, undefined, databaseDescription);

  //
  // This will only return the SQL query.
  let response = await llmToSQL.run("Can you get all the instructors names?");
  console.log("SQL Query: ", response.sqlQuery);


  
});


test.skip('Live test, passing only the llm configs, and a description of the database gotten through manual sql query', async () => {
  let llmConfig = {
    apiKey: process.env.OPENAI_API_KEY,
  };

  let llmModelConfig = {
    model: 'gpt-3.5-turbo',
  }

  //
  // A better way to get the database description is through the following sql query.
  // SELECT table_name, column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = "{database_name}"
  let databaseDescription = databseDescriptionFixture; // This is the description of the database, copy and paste it from the query above.
  const llmToSQL2 = new LLMToSQL(undefined, llmConfig, llmModelConfig, undefined, undefined, databaseDescription);

  //
  // This will only return the SQL query.
  let response = await llmToSQL2.run("Can you get all the instructors names?");
  console.log("SQL Query: ", response.sqlQuery);
});


