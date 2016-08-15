"use strict";

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , Permission = require("../../Util/Permission");

class Admin extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("eval", {
            permission: Permission.BOT_ADMIN
        }, this.evalCommand));
    }

    evalCommand(tail, author, channel) {
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
            return `\`\`\`\n${e.stack || e}\n\`\`\``
        }

        if (promised && output instanceof Promise) {
            return output.then(o => `\`\`\`\n${o}\n\`\`\``)
                    .catch(e => `\`\`\`\n${e.stack || e}\n\`\`\``);
        }

        if (silent)
            return null;

        return `\`\`\`\n${output}\n\`\`\``;
    }
}

module.exports = Admin;