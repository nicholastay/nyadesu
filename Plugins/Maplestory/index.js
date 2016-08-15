"use strict";

const axios = require("axios")
	, cheerio = require("cheerio")
    , cheerioAdv = require('cheerio-advanced-selectors');

const Plugin = require("../../Base/Plugin")
	, PluginCommand = require("../../Base/PluginCommand")
	, Bucket = require("../../Base/Bucket");

class Maplestory extends Plugin {
	constructor() {
		super();

		this.profileBucket = new Bucket("Maplestory.fetchProfile", 1, "minute", { perUser: true });

		this.addCommand(new PluginCommand("maple", this.fetchProfile.bind(this)));
	}

	fetchProfile(tail, author, channel) {
		if (!tail[0])
			return `❌ \`${author.username}#${author.discriminator}: You need to give a character name...\``;

        if (!Nyadesu.Ratelimiting.tryRemoveToken(this.profileBucket, author))
          	return `❌ \`${author.username}#${author.discriminator}: Calm down bruv...\``;

        let charName = tail[0];

        return axios.get(`http://maplestory.nexon.net/rankings/overall-ranking/legendary?character_name=${charName}`)
        	.then(d => d.data)
        	.then(html => {
        		if (html.indexOf(charName) < 0)
        			return `❌ \`${author.username}#${author.discriminator}: Invalid character name...\``;

        		let $ = cheerio.load(html);

        		let char = $(`.ranking-container tbody tr:contains(${charName})`);

        		let childTd = char.children("td")
                  , rank = "#" + childTd.eq(0).text()
        		  , img = childTd.eq(1).children("img")[0].attribs.src
        		  , world = childTd.eq(3).children()[0].attribs.title
                  , job = childTd.eq(4).children()[0].attribs.title
                  , _levelMove = childTd.eq(5).text().split("\n")
                  , level = _levelMove[1].trim()
                  , exp = _levelMove[2].trim().replace(")", "exp)")
                  , moveUpDown = childTd.eq(5).children("div[class*=rank]")[0].attribs.class === "rank-up" ? "+" : "-"
                  , move = _levelMove[3].trim();


        		let output = `\`\`\`
MapleStory: ${charName}
============================
World: ${world}
Level: ${level}
Job: ${job}
Global Rank: ${rank} ${exp} [${moveUpDown}${move}]
\`\`\``
                
                return axios.get(img, { responseType: "arraybuffer"} )
                    .then(imgData => {
                        channel.createMessage(output, {
                            file: imgData.data,
                            name: charName + ".png"
                        });

                        return null;
                    })
                    .catch(() => output + `\n\nCharacter Image: ${img}`);
        	});
	}
}

module.exports = Maplestory;