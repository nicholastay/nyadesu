"use strict";

const Plugin = require("../../Base/Plugin");

class Logger extends Plugin {
    constructor() {
        super();

        this.addRawHandler("consolelogger", m => {
            Nyadesu.Logging.log("Client-Chat", `${m.author.username}: ${m.content}`);
        });
    }
}

module.exports = Logger;