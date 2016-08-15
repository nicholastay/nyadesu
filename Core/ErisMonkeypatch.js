"use strict";

const Eris = require("eris");

class ErisMonkeypatch {
    constructor() {
        this.monkeypatch();
    }

    monkeypatch() {
        Eris.Message.prototype.createMessage = function() { return Nyadesu.Client.createMessage.apply(Nyadesu.Client, [this.channel.id].concat(argsToArray(arguments))); }
        Eris.Message.prototype.delete = function() { return Nyadesu.Client.deleteMessage(this.channel.id, this.id); }
        Eris.Channel.prototype.createMessage = function() { return Nyadesu.Client.createMessage.apply(Nyadesu.Client, [this.id].concat(argsToArray(arguments))); }
        Eris.Channel.prototype.sendTyping = function() { return Nyadesu.Client.sendChannelTyping(this.id); }
        Eris.PrivateChannel.prototype.createMessage = function() { return Nyadesu.Client.createMessage.apply(Nyadesu.Client, [this.id].concat(argsToArray(arguments))); }
        Eris.PrivateChannel.prototype.sendTyping = function() { return Nyadesu.Client.sendChannelTyping(this.id); }
    }
}

// "borrowed" from babel :&)
function argsToArray(inputArgs) {
    for (var _len = inputArgs.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = inputArgs[_key];
    }

    return args;
}

module.exports = ErisMonkeypatch;