/**
 * A SQL database structure, gotten from the following query:
 * 
 * SELECT table_name, column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = "TestIC";
 */
export let databseDescriptionFixture = `
Current database: TestIC

+------------+--------------+-----------+-------------+------------+----------------+-------+
| TABLE_NAME | COLUMN_NAME  | DATA_TYPE | IS_NULLABLE | COLUMN_KEY | COLUMN_DEFAULT | EXTRA |
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
| instructor | salary       | decimal   | YES         |            | NULL           |       |
| prereq     | course_id    | varchar   | NO          | PRI        | NULL           |       |
| prereq     | prereq_id    | varchar   | NO          | PRI        | NULL           |       |
| section    | course_id    | varchar   | NO          | PRI        | NULL           |       |
| section    | sec_id       | varchar   | NO          | PRI        | NULL           |       |
| section    | semester     | varchar   | NO          | PRI        | NULL           |       |
| section    | year         | decimal   | NO          | PRI        | NULL           |       |
| section    | building     | varchar   | YES         | MUL        | NULL           |       |
| section    | room_number  | varchar   | YES         |            | NULL           |       |
| section    | time_slot_id | varchar   | YES         |            | NULL           |       |
| student    | ID           | varchar   | NO          | PRI        | NULL           |       |
| student    | name         | varchar   | NO          |            | NULL           |       |
| student    | dept_name    | varchar   | YES         | MUL        | NULL           |       |
| student    | tot_cred     | decimal   | YES         |            | NULL           |       |
| takes      | ID           | varchar   | NO          | PRI        | NULL           |       |
| takes      | course_id    | varchar   | NO          | PRI        | NULL           |       |
| takes      | sec_id       | varchar   | NO          | PRI        | NULL           |       |
| takes      | semester     | varchar   | NO          | PRI        | NULL           |       |
| takes      | year         | decimal   | NO          | PRI        | NULL           |       |
| takes      | grade        | varchar   | YES         |            | NULL           |       |
| teaches    | ID           | varchar   | NO          | PRI        | NULL           |       |
| teaches    | course_id    | varchar   | NO          | PRI        | NULL           |       |
| teaches    | sec_id       | varchar   | NO          | PRI        | NULL           |       |
| teaches    | semester     | varchar   | NO          | PRI        | NULL           |       |
| teaches    | year         | decimal   | NO          | PRI        | NULL           |       |
| time_slot  | time_slot_id | varchar   | NO          | PRI        | NULL           |       |
| time_slot  | day          | varchar   | NO          | PRI        | NULL           |       |
| time_slot  | start_hr     | decimal   | NO          | PRI        | NULL           |       |
| time_slot  | start_min    | decimal   | NO          | PRI        | NULL           |       |
| time_slot  | end_hr       | decimal   | YES         |            | NULL           |       |
| time_slot  | end_min      | decimal   | YES         |            | NULL           |       |
+------------+--------------+-----------+-------------+------------+----------------+-------+
`