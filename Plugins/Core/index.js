"use strict";

const axios = require("axios");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand");

class Core extends Plugin {
    constructor() {
        super();

        // this.addRawHandler("about nyadesu", m => {
        //     if (m.content === "!nyadesu")
        //         m.createMessage("desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016");
        // });
        
        this.addCommand(new PluginCommand("nyadesu", this.nyadesuCommand));

        this.addCommand(new PluginCommand("meow", {
            reply: true
        }, this.meowCommand));

        // this.addCommand(new PluginCommand("fail", "deliberate promise reject", () => Promise.reject("o_o")));
    }

    nyadesuCommand() {
        return "desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016";
    }

    meowCommand() {
        return axios.get("http://random.cat/meow")
                    .then(r => r.data.file);
    }
}

module.exports = Core;