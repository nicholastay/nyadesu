"use strict";

const fetch = require("node-fetch")
    , cheerio = require("cheerio");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , BucketInfo = require("../../Base/BucketInfo")
    , UserError = require("../../Base/UserError");

class Maplestory extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("maple", {
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Maplestory.fetchProfile", 1, "minute", { perUser: true }),
            embed: true,
            embedFooter: true
        }, this.fetchProfile.bind(this)));
    }

    fetchProfile(tail) {
        let charName = tail[0];

        return fetch(`http://maplestory.nexon.net/rankings/overall-ranking/legendary?character_name=${charName}`)
            .then(r => r.text())
            .then(html => {
                if (html.indexOf(charName) < 0)
                    throw new UserError("Invalid MapleStory character name...");

                let $ = cheerio.load(html);

                let char = $(`.ranking-container tbody tr:contains(${charName})`);

                let childTd = char.children("td")
                  , rank = "#" + childTd.eq(0).text()
                  , img = childTd.eq(1).children("img")[0].attribs.src
                  , world = childTd.eq(3).children()[0].attribs.title
                  , job = childTd.eq(4).children()[0].attribs.title
                  , _levelMove = childTd.eq(5).text().split("\n")
                  , level = _levelMove[1].trim()
                  , exp = _levelMove[2].trim().replace("(", "").replace(")", "exp")
                  , moveUpDown = childTd.eq(5).children("div[class*=rank]")[0].attribs.class === "rank-up" ? "\↑" : "\↓"
                  , move = _levelMove[3].trim();


//                 let output = `\`\`\`
// MapleStory: ${charName}
// ============================
// World: ${world}
// Level: ${level}
// Job: ${job}
// Global Rank: ${rank} ${exp} [${moveUpDown}${move}]
// \`\`\``;
                
                return {
                    title: `MapleStory Character Data - ${charName}`,
                    color: 16741407, // maple orange
                    image: {
                        url: img,
                    },
                    thumbnail: {
                        url: `http://s.nx.com/s2/game/maplestory/maple2007/image/icon/ico_world_${world.toLowerCase()}.gif`
                    },
                    fields: [
                        {
                            name: "Global Rank",
                            value: rank,
                            inline: true
                        },
                        {
                            name: "Movement",
                            value: `${move} ${moveUpDown}`,
                            inline: true
                        },
                        {
                            name: "Job",
                            value: job,
                            inline: true
                        },
                        {
                            name: "World",
                            value: world,
                            inline: true
                        },
                        {
                            name: "Level",
                            value: level,
                            inline: true
                        },
                        {
                            name: "Experience (EXP)",
                            value: exp,
                            inline: true
                        }
                    ]
                };
            });
    }
}

module.exports = Maplestory;