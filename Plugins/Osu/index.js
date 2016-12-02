"use strict";

const Nodesu = require("nodesu");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , BucketInfo = require("../../Base/BucketInfo");

class Osu extends Plugin {
    constructor() {
        super();

        this.api = new Nodesu.Client(this.config.apiKey);

        this.addCommand(new PluginCommand("osu", {
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Osu.getUser", 20, "minute", { perUser: true }),
            embed: true,
            embedFooter: true
        }, this.osuCommand.bind(this)));
    }

    osuCommand(tail) {
        let user = tail.join(" ");
        return this.api.user
            .get(user)
            .then(data => {
                // get percent level
                let level = Math.floor(Number(data.level));
                let percentInLevel = Math.round((data.level - level) * 100);

//                 return `\`\`\`
// osu! profile information for: ${data.username}
// ---------------------------------------------------------
// Username: ${data.username}
// User ID: ${data.user_id}
// Avatar: https://a.ppy.sh/${data.user_id}.jpg
// PP: ${Math.floor(Number(data.pp_raw))}pp
// Rank: #${data.pp_rank} (#${data.pp_country_rank} in ${data.country})
// Accuracy: ${Number(data.accuracy).toFixed(2)}%
// Level: ${level} (${percentInLevel}%)
// 300/100/50: ${data.count300}/${data.count100}/${data.count50}
// Playcount: ${data.playcount}
// Ranked / Total Score: ${data.ranked_score} / ${data.total_score}
// \`\`\``;
            
                return {
                    color: 12259703,
                    url: `https://new.ppy.sh/u/${data.user_id}`,
                    author: {
                        name: `${data.username} - osu! profile data`,
                        icon_url: "https://new.ppy.sh/images/layout/osu-logo.png"
                    },
                    thumbnail: {
                        url: `https://a.ppy.sh/${data.user_id}`
                    },
                    fields: [
                        {
                            name: "User ID",
                            value: data.user_id,
                            inline: true
                        },
                        {
                            name: "PP",
                            value: `${Math.floor(Number(data.pp_raw))}pp`,
                            inline: true
                        },
                        {
                            name: "Rank (PP-based)",
                            value: `#${data.pp_rank} (#${data.pp_country_rank} ${data.country})`,
                            inline: true
                        },
                        {
                            name: "Level",
                            value: `${level} (${percentInLevel}%)`,
                            inline: true
                        },
                        {
                            name: "Accuracy",
                            value: `${Number(data.accuracy).toFixed(2)}%`,
                            inline: true
                        },
                        {
                            name: "300/10/50 Count",
                            value: `${data.count300}/${data.count100}/${data.count50}`,
                            inline: true
                        },
                        {
                            name: "Playcount",
                            value: data.playcount,
                            inline: true
                        },
                        {
                            name: "Ranked Score",
                            value: data.ranked_score,
                            inline: true
                        },
                        {
                            name: "Total Score",
                            value: data.total_score,
                            inline: true
                        }
                    ]
                };
            });
    }
}

module.exports = Osu;