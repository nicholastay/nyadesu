
exports.up = function(knex, Promise) {
    return knex.schema.table("ServerSettings", table => {
        table.boolean("voice_dupes").defaultTo(false);
        table.integer("voice_userlimit");
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table("ServerSettings", table => {
        table.dropColumn("voice_dupes");
        table.dropColumn("voice_userlimit");
    });
};
