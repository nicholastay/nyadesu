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
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Core.testWebsite", 3, "minute", { perUser: true }),
            embed: true,
            embedFooter: true
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
                  , reg = DOWNFOREVERYONE_REGEX.exec(msg)
                  , up = !!reg;
                // if (!reg)
                //     return `❌ It doesn't seem to be just you, \`${website}\` seems to be offline.`;

                // return `✅ \`${reg[1]}\` seems to be up, online and functional.`;

                return {
                    title: `Website Status Check`,
                    description: up ? `${reg[1].split("/").pop()} is currently ONLINE and functional. ✅` : `It doesn't seem to be just you, ${website.split("/").pop()} seems to be DOWN. ❌`,
                    color: up ? 2026017 : 12525600,
                    footer: {
                        text: `powered by nyadesu v${Nyadesu.version} & downforeveryoneorjustme`,
                        icon_url: "https://i.imgur.com/2eJY0uo.png"
                    }
                };
            });
    }

    updatesCommand() {
        return simpleGit.logAsync(["-n", "5"]) // last 5
            .then(r => r.all.map(d => `     * \`${d.hash.substr(0, 7)}\` ${d.message}`))
            .then(c => `**Updatelog - Last 5 commits made to** \`nyadesu\` (master)\n${c.join("\n")}`);
    }
}

module.exports = Utility;