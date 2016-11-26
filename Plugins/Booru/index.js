"use strict";

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , Gelbooru = require("./Struct/Providers/Gelbooru");

class Booru extends Plugin {
    constructor() {
        super();

        this.providers = {
            Gelbooru: new Gelbooru()
        };

        this.addCommand(new PluginCommand("gelbooru", {
            reply: true,
            requireInput: 1
        }, this.gelbooruCommand.bind(this)));
    }

    gelbooruCommand(tail) {
        let tag = tail.join("+");
        return this.providers.Gelbooru.get(tag);
    }
}

module.exports = Booru;