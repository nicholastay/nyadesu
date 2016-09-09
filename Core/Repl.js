"use strict";

const repl = require("repl");

class Repl {
    constructor() {
        Nyadesu.Events.on("nyadesu.loaded", this.start.bind(this));
    }

    start() {
        Nyadesu.Logging.log("Repl", "Loading REPL, starting...");
        this.client = repl.start({
            prompt: (Nyadesu.Config.Repl && Nyadesu.Config.Repl.prompt) || "nyadesu » "
        });
        this.attachCommands();

        console.log("\n");
    }

    attachCommands() {
        this.client.defineCommand("r", {
            help: '[Plugins] Reload a plugin',
            action: h => Nyadesu.Plugins._reload(h)
        });
    }
}

module.exports = Repl;