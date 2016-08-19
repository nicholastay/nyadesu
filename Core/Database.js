"use strict";

const Knex = require("knex");

class Database extends Knex {
    static get configDefaults() {
        return {
            client: "pg",
            connection: {
                host: "127.0.0.1",
                user: "postgres",
                password: "postgres",
                database: "nyadesu"
            },
            migrations: {
                tableName: "KnexMigrations"
            }
        };
    }

    constructor() {
        super(Nyadesu.Config.Database);
    }
}

module.exports = Database;