"use strict";

class Plugin {
    constructor() {
        this.rawHandlers = {};
    }

    addRawHandler(name, handler) {
        this.rawHandlers[name] = handler;
    }
}

module.exports = Plugin;