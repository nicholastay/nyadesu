
exports.up = function(knex, Promise) {
    return knex.schema.createTable("Commands", table => {
        table.increments();
        table.string("trigger");
        table.string("output");
        table.string("server_id");
        // table.timestamps(); - https://github.com/tgriesser/bookshelf/issues/587 postgres
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("Commands");
};
