"use strict";

const Eris = require("eris");

const ErisMonkeypatch = require("../Util/ErisMonkeypatch");

class Client extends Eris {
    static get configDefaults() {
        return {
            token: "DISCORD_TOKEN_HERE",
            prefix: "!"
        }
    }

    constructor() {
        let token = Nyadesu.Config.Client.token;
        super(token);
        
        this.on("ready", () => Nyadesu.Events.emit("client.ready"));
        this.on("messageCreate", m => Nyadesu.Events.emit("client.message", m));

        // patch
        ErisMonkeypatch.patch(this);
        Nyadesu.Logging.success("Client", "Loaded Eris client + slight OOP patched.");
    }
}

module.exports = Client;