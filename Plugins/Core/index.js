"use strict";

const Plugin = require("../../Base/Plugin");

class Core extends Plugin {
    constructor() {
        super();

        this.addRawHandler("raw_kyaa", m => {
            if (m.content === "!kyaa")
                Nyadesu.Client.createMessage(m.channel.id, "desunya!");
        });

        this.addRawHandler("test_config", m => {
            if (m.content === "!test")
                Nyadesu.Client.createMessage(m.channel.id, this.config.test);
        });
    }
}

module.exports = Core;