"use strict";

const chalk = require("chalk");

// This class handles all the cleanup stuff, like on a ctrl+c to exit, or on a uncaught exception.
// Mainly to cleanup stale voice connections and update the bot status.
class Cleanup {
    constructor() {
        this.attachEvents();
    }

    attachEvents() {
        process.on("SIGINT", this._exitHandler); // CTRL+C -- only if they do it twice, past the REPL, handled by node itself
        process.on("uncaughtException", this._exitHandler);
    }

    _exitHandler(err) {
        if (this.alive) {
            if (Nyadesu.Client.voiceConnections.size > 0) // cleanup stale voices
                Nyadesu.Client.voiceConnections.forEach((val, key) =>
                    Nyadesu.Client.leaveVoiceChannel(key));

            Nyadesu.Client.editStatus(true, {
                name: err ? "<crashed!> :(" : "<maintenance>"
            });
        }

        console.log("\n");
        if (err) // there was a crash
            return Nyadesu.Logging.fatal(chalk.red("UNCAUGHT"), err.stack || err);

        Nyadesu.Logging.log("Nyadesu", "Safely shut down as maintenance mode.");
        process.exit(0);
    }
}

module.exports = Cleanup;