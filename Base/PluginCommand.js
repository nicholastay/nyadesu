"use strict";

class PluginCommand {
    constructor(trigger, description, handler) {
        this.trigger = trigger;
        this.description = description;
        this.handler = handler;

        this.caseSensitive = false;
        
        this.allowPM = true;
        this.allowServerChat = true;
    }
}

module.exports = PluginCommand;