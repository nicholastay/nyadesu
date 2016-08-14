"use strict";

const axios = require("axios");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand");

class Core extends Plugin {
    constructor() {
        super();

        this.addRawHandler("about nyadesu", m => {
            if (m.content === "!nyadesu")
                Nyadesu.Client.createMessage(m.channel.id, "desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016");
        });

        this.addCommand(new PluginCommand("meow", { description: "fun meow command with promises" }, () => {
            return axios.get("http://random.cat/meow")
                        .then(r => r.data.file);
        }));

        // this.addCommand(new PluginCommand("fail", "deliberate promise reject", () => Promise.reject("o_o")));
    }
}

module.exports = Core;