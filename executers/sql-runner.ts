import { Sequelize, Options } from "sequelize";

export class SQLRunner {
    private sequelize: Sequelize;

    /**
     * Constructor for the SQL driver
     * 
     * @param options Options for the Sequelize constructor
     * @param sequelize An existing Sequelize instance to use
     */
    constructor(options: Options | undefined, sequelize: Sequelize | undefined) {
        if (sequelize) {
            this.sequelize = sequelize;
        }
        else {
            this.sequelize = new Sequelize(options);
        }
    }
    
    /**
     * Connects to the database
     */
    async connect() {
        await this.sequelize.authenticate();
        console.log("Connected to the database");
    }

    /**
     * This function runs a query on the database
     * 
     * @param query the query to run
     * @returns the results of the query
     */
    async runQuery(query: string) {
        return await this.sequelize.query(query);
    }
}