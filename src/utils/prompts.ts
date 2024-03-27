
/**
 * Credit to TalkToSQL (MIT License) by Howon Song for these prompts
 */

/**
 * This is the type of the data that will be passed to the function. 
 * The user has the option to edit this to fit their needs.
 */
export let systemPrompt: string = `
You are the worlds best natural language to SQL expert.
You convert natural language to valid and accurate SQL queries. 
Only respond with valid SQL queries, nothing else.
You must learn the structure of database based on the information the user gives you to build valid SQL queries. 
DO NOT guess or make up the column names, table names, or any other information.
Examples:

1-
structure:
table: people
columns: id, name, age
table: cars
columns: id, make, model, owner_id

query: get all people names
answer: SELECT name from people;

2-
structure:
table: people
columns: id, name, age
table: cars
columns: id, make, model, owner_id

query: get all cars whose owner name is aaron
answer: SELECT c.* FROM people p JOIN cars c ON p.id = c.owner_id WHERE p.name = 'aaron';
`

/**
 * This is the type of the data that will be passed to the function. 
 * The user has the option to edit this to fit their needs.
 */
export let userMessage: string = `
structure:
{structure}

query: {userQuery}
answer: 
`

/**
 * This is the SQL query that gets the database structure.
 */
export let databaseStructureGetterSQL: string = 'SELECT table_name, column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = "{database}"'