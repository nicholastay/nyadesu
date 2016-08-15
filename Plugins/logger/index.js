"use strict";

const eris = require("eris")
    , chalk = require("chalk");

const Plugin = require("../../Base/Plugin");

class Logger extends Plugin {
    constructor() {
        super();

        this.addRawHandler("ConsoleLogger", this.logToConsole);
    }

    logToConsole(m) {
        let c = m.content;
        if (c.indexOf("\n") >= 0)
            c = c.split("\n").shift() + "... (truncated new line)";

        if (m.channel instanceof eris.PrivateChannel) {
            if (m.author.id === Nyadesu.Client.user.id)
                return Nyadesu.Logging.log("Client-PM", chalk.magenta("nyadesu") + " -> " + chalk.yellow(`${m.author.username}#${m.author.discriminator}`) + `: ${c}`);

            return Nyadesu.Logging.log("Client-PM", chalk.yellow(`${m.author.username}#${m.author.discriminator}`) + " -> " + chalk.magenta("nyadesu") + `: ${c}`);
        }

        return Nyadesu.Logging.log("Client-Chat", chalk.magenta(`[${m.channel.guild.name} // #${m.channel.name}] `) + chalk.yellow(`${m.author.username}#${m.author.discriminator}`) + `: ${c}`);
    }
}

module.exports = Logger;