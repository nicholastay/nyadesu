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
    }
}

module.exports = Client;