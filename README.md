# LLMToSQL 🚀

[![npm version](https://badge.fury.io/js/llm-to-sql.svg)](https://badge.fury.io/js/llm-to-sql)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LLMToSQL is a powerful TypeScript npm library that allows you to seamlessly convert natural language to SQL queries programmatically, and execute the queries against your DB. Say goodbye to manual translation and hello to automated efficiency!

## Features

- 📝 Convert natural language to SQL queries effortlessly
- ❤️ Auto-heal functionality to refine LLM responses to ensure valid SQL queries
- 📚 Automatically execute the translated SQL queries
- 🛠️ Supports various database systems, and LLM models
- 🧩 Simple and intuitive API

## Installation

To install LLMToSQL, simply run the following command:
    
    npm install llm-to-sql
    

or

    yarn add llm-to-sql
    

## Usage
Check out examples at https://github.com/olsenbudanur/llm-to-sql/blob/main/src/tests/example-usage.test.ts <br>
Either pass in LLM API and Sequelize objects, 
```typescript
let args = {
    llmApi: llmApiObj,
    sequelize: sequelize,
} as LLMToSQLArgs;
```
or define their configs and pass in configs
```typescript
let args = {
    llmApiConfig: llmConfig,
    llmApiModelConfig: llmModelConfig,
    sequelizeOptions: sqlConfig,
} as LLMToSQLArgs;
```
or give plain text description
```typescript
let databaseDescription = "a single table called instructors the following columns: id, name, email, phone, address, city, state, zip, country, and date_of_birth. The table name is 'instructors'."
args.sqlInfo = databaseDescription;
```

Construct LLMToSQL object
```typescript
const llmToSQL = new LLMToSQL(args);
```

Example natural language prompt to SQL, 
```typescript
let response = await llmToSQL.run("Can you get all the instructors names?", execute=true);
console.log("SQL Query: ", response.sqlQuery);
console.log("Results: ", response.results);
```
output: <br>
SQL Query:  SELECT name FROM instructor; <br>
Results: [
      [
        { name: 'Srinivasan' },
        { name: 'Wu' },
....


## Contributing
Contributions are welcome! Feel free to submit issues or pull requests to improve the library.

## License
LLMToSQL is [MIT licensed](https://opensource.org/licenses/MIT).
