"use strict";

const Permission = require("../Util/Permission");

class PluginCommand {
    constructor(trigger, options, handler) {
        if (!handler && typeof options === "function") {
            handler = options;
            options = {};
        }

        this.trigger = trigger;
        this.handler = handler;
        
        this.allowPM = undefOrDefault(options.allowPM, true);
        this.allowServerChat = undefOrDefault(options.allowServerChat, true);

        this.reply = options.reply || false;
        this.softReply = options.softReply || false;

        this.autoCleanup = options.autoCleanup || null; // set to ms value for cleanup

        this.permission = options.permission || Permission.NONE;
    }
}

function undefOrDefault(property, defaultValue) {
    return property === undefined ? defaultValue : property;
}

module.exports = PluginCommand;