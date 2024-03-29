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

```Javascript
const { LLMToSQL } = require('llm-to-sql');

// Run this to get your database schema

//  SELECT (table_name, column_name, data_type,
//  is_nullable, column_key, column_default, extra)
//  FROM information_schema.columns
//  WHERE table_schema = "{DATABASE_NAME}";

const sqlInfo = `
  Current database: TestIC
  +------------+--------------+-----------+-------------+------------+----------------+-------+
  | advisor    | s_ID         | varchar   | NO          | PRI        | NULL           |       |
  | advisor    | i_ID         | varchar   | YES         | MUL        | NULL           |       |
  | classroom  | building     | varchar   | NO          | PRI        | NULL           |       |
  | classroom  | room_number  | varchar   | NO          | PRI        | NULL           |       |
  | classroom  | capacity     | decimal   | YES         |            | NULL           |       |
  | course     | course_id    | varchar   | NO          | PRI        | NULL           |       |
  | course     | title        | varchar   | YES         |            | NULL           |       |
  | course     | dept_name    | varchar   | YES         | MUL        | NULL           |       |
  | course     | credits      | decimal   | YES         |            | NULL           |       |
  | department | dept_name    | varchar   | NO          | PRI        | NULL           |       |
  | department | building     | varchar   | YES         |            | NULL           |       |
  | department | budget       | decimal   | YES         |            | NULL           |       |
  | instructor | ID           | varchar   | NO          | PRI        | NULL           |       |
  | instructor | name         | varchar   | NO          |            | NULL           |       |
  | instructor | dept_name    | varchar   | YES         | MUL        | NULL           |       |
  | instructor | salary       | decimal   | YES         |            | NULL           |       |`;

let llmConfig = {
  apiKey: YOUR_API_KEY,
};

let llmModelConfig = {
  model: 'gpt-3.5-turbo',
};

let args = {
  llmApiConfig: llmConfig,
  llmApiModelConfig: llmModelConfig,
  sqlInfo: sqlInfo,
};

const runner = new LLMToSQL(args);

runner.run('get all the instructors').then((SQLStatement) => {
  console.log(SQLStatement);
});

```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the library.

## License

LLMToSQL is [MIT licensed](https://opensource.org/licenses/MIT).
