"use strict";

const Plugin = require("../../Base/Plugin");

class Core extends Plugin {
    constructor() {
        super();

        this.addRawHandler("raw_kyaa", m => {
            if (m.content === "!kyaa")
                Nyadesu.Client.createMessage(m.channel.id, "desunya!");
        });
    }
}

module.exports = Core;