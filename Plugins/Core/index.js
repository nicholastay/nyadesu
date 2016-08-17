"use strict";

const axios = require("axios")
    , htmlToText = require("html-to-text");

const Plugin = require("../../Base/Plugin")
    , BucketInfo = require("../../Base/BucketInfo")
    , PluginCommand = require("../../Base/PluginCommand");

const DOWNFOREVERYONE_REGEX = /just you\. (.*?) is up\./;

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

        this.addCommand(new PluginCommand("testwebsite", {
            softReply: true,
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Core.testWebsite", 3, "minute", { perUser: true })
        }, this.testWebsiteCommand));

        // this.addCommand(new PluginCommand("fail", "deliberate promise reject", () => Promise.reject("o_o")));
    }

    nyadesuCommand() {
        return "desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016";
    }

    meowCommand() {
        return axios.get("http://random.cat/meow")
                    .then(r => r.data.file);
    }

    testWebsiteCommand(tail) {
        let website = tail.join(" ");
        return axios.get(`http://downforeveryoneorjustme.com/${website}`)
            .then(r => {
                if (r.data.indexOf("doesn't look like a site") >= 0)
                    return `❌ Invalid website, please go away :<`;

                let msg = htmlToText.fromString(r.data, { ignoreHref: true })
                  , reg = DOWNFOREVERYONE_REGEX.exec(msg);
                if (!reg)
                    return `❌ It doesn't seem to be just you, \`${website}\` seems to be offline.`;

                return `✅ \`${reg[1]}\` seems to be up, online and functional.`;
            });
    }
}

module.exports = Core;