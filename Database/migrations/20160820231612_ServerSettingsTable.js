
exports.up = function(knex, Promise) {
    return knex.schema.createTable("ServerSettings", table => {
        table.increments();
        table.string("server_id").unique();
        table.boolean("voice_allowed").defaultTo(false);
        table.specificType("ignored_channels", "text[]"); // https://github.com/tgriesser/knex/issues/569
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable("ServerSettings");
};
