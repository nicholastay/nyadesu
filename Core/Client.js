"use strict";

const Eris = require("eris");

class Client extends Eris {
    static get configDefaults() {
        return {
            token: "DISCORD_TOKEN_HERE"
        }
    }

    constructor() {
        let token = Nyadesu.Config.Client.token;
        super(token);
        
        this.on("ready", () => Nyadesu.Events.emit("client.ready"));
        this.on("messageCreate", m => Nyadesu.Events.emit("client.message", m));
    }
}

module.exports = Client;