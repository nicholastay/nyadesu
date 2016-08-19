
exports.up = function(knex, Promise) {
    return knex.schema.createTable("Commands", table => {
        table.increments();
        table.string("trigger");
        table.string("output");
        table.string("server_id");
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("Commands");
};
