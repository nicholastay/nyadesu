"use strict";

const fs = require("fs")
    , axios = require("axios");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , Permission = require("../../Util/Permission");

const BASIC_URL_REGEX = /^https?:\/\//i;

class Admin extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("eval", {
            permission: Permission.BOT_ADMIN,
            onReturnSuccess: true,
            requireInput: 1
        }, this.evalCommand));

        this.addCommand(new PluginCommand("setavatar", {
            permission: Permission.BOT_ADMIN,
            onReturnSuccess: true,
            requireInput: 1,
            softReply: true
        }, this.setAvatarCommand));
    }

    evalCommand(tail, author) {
        let silent = false
          , promised = false;
        if (tail[tail.length-1] === "-%s") { // silent
            silent = true;
            tail.pop();
        } else if (tail[tail.length-1] === "-%p") { // promise
            promised = true;
            tail.pop();
        }

        let output;
        try {
            output = eval(tail.join(" "));
        }
        catch (e) {
            return `❌ \`${author.softMention}\`:\n\`\`\`\n${e.stack || e}\n\`\`\``;
        }

        if (promised && output instanceof Promise) {
            return output.then(o => `\`${author.softMention}\`:\n\`\`\`\n${o}\n\`\`\``)
                    .catch(e => `❌ \`${author.softMention}\`:\n\`\`\`\n${e.stack || e}\n\`\`\``);
        }

        if (silent)
            return null;

        return `\`${author.softMention}\`:\n\`\`\`\n${output}\n\`\`\``;
    }

    setAvatarCommand(tail) {
        let link = tail.join(" ")
          , prom;

        if (BASIC_URL_REGEX.test(link)) {
            prom = axios.get(tail.join(link), { responseType: "arraybuffer" } )
                .then(r => r.data);
        } else {
            prom = Promise.resolve(fs.readFileSync(link));
        }

        return prom
            .then(d => "data:image/jpg;base64," + d.toString('base64'))
            .then(a => Nyadesu.Client.editSelf({ avatar: a }))
            .then(() => "New avatar successfully set.");
    }
}

module.exports = Admin;