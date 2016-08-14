"use strict";

const Permission = require("../Util/Permission");

class PluginCommand {
    constructor(trigger, options, handler) {
        this.trigger = trigger;
        this.description = "";
        this.handler = handler;
        
        this.allowPM = true;
        this.allowServerChat = true;

        this.autoCleanup = null; // set to ms value for cleanup

        this.permission = Permission.NONE;

        for (let k in options)
            this[k] = options[k]; // merge in options
    }
}

module.exports = PluginCommand;