"use strict";

class Plugin {
    constructor() {
        this.rawHandlers = {};
    }

    get config() {
        return (Nyadesu.Config.Plugin[this.constructor.name]) || {};
    }

    addRawHandler(name, handler) {
        this.rawHandlers[name] = handler;
    }
}

module.exports = Plugin;