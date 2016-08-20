"use strict";

class SettingsManager {
    constructor() {
        this.servers = {};

        this.reloadSettings();
    }

    reloadSettings(guildId) {
        if (!guildId) {
            return Nyadesu.Database
                .select()
                .from("ServerSettings")
                .then(settings => {
                    settings.forEach(s => this.servers[s.server_id] = s);
                });
        }

        return Nyadesu.Database
            .select()
            .where("server_id", guildId)
            .from("ServerSettings")
            .then(s => this.servers[guildId] = s[0]);
    }

    initServer(guildId) {
        if (this.servers[guildId])
            return Promise.reject("guild already init'd");

        return Nyadesu.Database
            .insert({ server_id: guildId })
            .into("ServerSettings")
            .then(() => this.servers[guildId] = {});
    }

    editSetting(guildId, setting, value) {
        let prom = Promise.resolve();
        if (!this.servers[guildId])
            prom = this.initServer(guildId);

        return prom.then(() => {
            let settings = {};
            settings[setting] = value;

            return Nyadesu.Database
                .where("server_id", guildId)
                .update(settings)
                .from("ServerSettings")
                .then(() => this.reloadSettings(guildId));
        });
    }

    getSetting(guildId, setting) {
        if (!this.servers[guildId] || !this.servers[guildId][setting])
            return null;
        return this.servers[guildId][setting];
    }
}

module.exports = SettingsManager;