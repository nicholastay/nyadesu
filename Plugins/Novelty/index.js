"use strict";

const fetch = require("node-fetch");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , BucketInfo = require("../../Base/BucketInfo")
    , UserError = require("../../Base/UserError");

const NON_ALPHANUMERIC_SPACE_CHECK = /[^A-Za-z0-9 ]/;
const GENERIC_UNICODE_BLOCK_CHAR = String.fromCharCode(55356);
const GENERIC_UNICODE_NUM_CHAR = String.fromCharCode(8419);

class Novelty extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("meow", {
            reply: true,
            rateLimitedInfo: new BucketInfo("Novelty.meow", 15, "minute", { perUser: true })
        }, this.meowCommand));

        this.addCommand(new PluginCommand("blockify", {
            reply: true,
            requireInput: 1,
        }, this.blockifyCommand));

        this.addCommand(new PluginCommand("square", {
            requireInput: 1
        }, this.squareCommand));
    }

    meowCommand() {
        return fetch("http://random.cat/meow")
            .then(r => r.json())
            .then(j => j.file);
    }

    blockifyCommand(tail) {
        let data = tail.join(" ");

        if (NON_ALPHANUMERIC_SPACE_CHECK.test(data))
            throw new UserError("Invalid input, you may only use letters, numbers and spaces.");

        return data.split("").map(w => {
            if (w === " ")
                return " "; // return just a space. will be padded out when joined

            // blockify stuff
            // numbers handling emoji
            // original number + generic character
            if (!isNaN(w))
                return w + GENERIC_UNICODE_NUM_CHAR;

            let letterCode = w.toLowerCase().charCodeAt(0);
            // send emoji letters -- unicode two character combo
            // generic character + a special character with a 56709 difference
            return GENERIC_UNICODE_BLOCK_CHAR + String.fromCharCode(letterCode + 56709);
        }).join(" "); // needs to be spaced out as unicode gets stuffed
    }

    squareCommand(tail) {
        let data = tail.join(" ");
        data = data.replace(/[ \n]/g, "").split(""); // replace spaces and new lines + to array

        let output = "";
        for (let i = 0; i < data.length; ++i) { // 'i' actually doesnt matter, just want to exec this many times
            output += data.join(" ") + "\n"; // space it out and new line
            data.push(data.shift()); // move the first letter to the end
        }

        return "```\n" + output + "\n```"; // code blockify
    }
}

module.exports = Novelty;