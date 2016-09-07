"use strict";

const fetch = require("node-fetch");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , BucketInfo = require("../../Base/BucketInfo")
    , UserError = require("../../Base/UserError");

const NON_ALPHANUMERIC_SPACE_CHECK = /[^A-Za-z0-9 ]/;
const NUMBER_LITERAL_MAP = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine"
};

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
    }

    meowCommand() {
        return fetch("http://random.cat/meow")
            .then(r => r.json())
            .then(j => j.file);
    }

    blockifyCommand(tail) {
        let data = tail.join(" ");

        if (NON_ALPHANUMERIC_SPACE_CHECK.test(data))
            throw new UserError("Invalid input, you may only use letters, numbers and spaces.")

        return data.split("").map(w => {
            if (w === " ")
                return " "; // return just a space. will be padded out when joined

            // blockify stuff
            // numbers handling emoji
            if (!isNaN(w))
                return `:${NUMBER_LITERAL_MAP[w]}:`;

            // send emoji letters
            return `:regional_indicator_${w.toLowerCase()}:`;
        }).join(" "); // needs to be spaced out as unicode gets stuffed
    }
}

module.exports = Novelty;