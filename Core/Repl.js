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
        this.client.defineCommand("l", {
            help: '[Plugins] Loads a plugin',
            action: h => Nyadesu.Plugins._load(h)
        });
        this.client.defineCommand("u", {
            help: '[Plugins] Unloads a plugin',
            action: h => Nyadesu.Plugins._unload(h)
        });
    }
}

module.exports = Repl;