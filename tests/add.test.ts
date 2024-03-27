import { LLMToSQL } from '../src';
import { OpenAIChatApi } from 'llm-api';
import { Sequelize } from 'sequelize';

// deactivate test

test('hyd', async () => {
  const llmApi = new OpenAIChatApi({
    apiKey: '',
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


  const llmToSQL = new LLMToSQL(llmApi, sequelize, undefined);
  let response = await llmToSQL.run("Can you get all the instructors names?");
  // await llmToSQL.validateDatabaseInformation();
});



// test('sql-runner', async () => {
//   const sqlRunner = new SQLRunner({
//     dialect: 'mysql',
//     host: 'localhost',
//     username: 'root',
//     password: '',
//     database: 'TestIC',
//   }, undefined);
//   await sqlRunner.connect();
//   const results = await sqlRunner.runQuery('SELECT table_name, column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = "TestIC"');

//   console.log(results);
//   console.log("hi")
//   expect(results).toBeTruthy();
// });




