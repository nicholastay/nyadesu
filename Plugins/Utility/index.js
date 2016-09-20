"use strict";

const fetch = require("node-fetch")
    , htmlToText = require("html-to-text");

const Plugin = require("../../Base/Plugin")
    , BucketInfo = require("../../Base/BucketInfo")
    , PluginCommand = require("../../Base/PluginCommand")
    , UserError = require("../../Base/UserError");

const DOWNFOREVERYONE_REGEX = /just you\. (.*?) is up\./;

class Utility extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("testwebsite", {
            reply: true,
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Core.testWebsite", 3, "minute", { perUser: true })
        }, this.testWebsiteCommand));
    }

    testWebsiteCommand(tail) {
        let website = tail.join(" ");
        return fetch(`http://downforeveryoneorjustme.com/${website}`)
            .then(r => r.text())
            .then(d => {
                if (d.indexOf("doesn't look like a site") >= 0)
                    throw new UserError("Invalid website, please go away :<");

                let msg = htmlToText.fromString(d, { ignoreHref: true })
                  , reg = DOWNFOREVERYONE_REGEX.exec(msg);
                if (!reg)
                    return `❌ It doesn't seem to be just you, \`${website}\` seems to be offline.`;

                return `✅ \`${reg[1]}\` seems to be up, online and functional.`;
            });
    }
}

module.exports = Utility;