"use strict";

class UserError extends Error {
    constructor(message) {
        super();
        
        this.name = "UserError";
        this.message = message || "(╯°□°）╯︵ ┻━┻";
        this.stack = null;
    }
}

module.exports = UserError;