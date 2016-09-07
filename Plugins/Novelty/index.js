"use strict";

const fetch = require("node-fetch");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , BucketInfo = require("../../Base/BucketInfo");

class Novelty extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("meow", {
            reply: true,
            rateLimitedInfo: new BucketInfo("Novelty.meow", 15, "minute", { perUser: true })
        }, this.meowCommand));
    }

    meowCommand() {
        return fetch("http://random.cat/meow")
            .then(r => r.json())
            .then(j => j.file);
    }
}

module.exports = Novelty;