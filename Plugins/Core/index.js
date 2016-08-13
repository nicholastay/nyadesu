"use strict";

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand");

class Core extends Plugin {
    constructor() {
        super();

        this.addRawHandler("about nyadesu", m => {
            if (m.content === "!nyadesu")
                Nyadesu.Client.createMessage(m.channel.id, "desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016");
        });

        this.addCommand(new PluginCommand("meow", "fun meow command", () => "meow desu!"))
    }
}

module.exports = Core;