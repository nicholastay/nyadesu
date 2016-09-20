"use strict";

const fetch = require("node-fetch")
    , htmlToText = require("html-to-text")
    , path = require("path")
    , simpleGit = require("simple-git")(path.resolve(__dirname, "../../"));

const Plugin = require("../../Base/Plugin")
    , BucketInfo = require("../../Base/BucketInfo")
    , PluginCommand = require("../../Base/PluginCommand")
    , UserError = require("../../Base/UserError");

const DOWNFOREVERYONE_REGEX = /just you\. (.*?) is up\./;
simpleGit.logAsync = Promise.promisify(simpleGit.log);

class Utility extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("testwebsite", {
            reply: true,
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Core.testWebsite", 3, "minute", { perUser: true })
        }, this.testWebsiteCommand));

        this.addCommand(new PluginCommand("nyaupdates", this.updatesCommand));
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

    updatesCommand() {
        return simpleGit.logAsync(["-n", "5"]) // last 5
            .then(r => r.all.map(d => `     * \`${d.hash.substr(0, 7)}\` ${d.message}`))
            .then(c => `**Updatelog - Last 5 commits made to** \`nyadesu\` (master)\n${c.join("\n")}`);
    }
}

module.exports = Utility;