"use strict";

const Eris = require("eris");

let client = null;
function monkeyPatch(firstClient) {
    client = firstClient;

    Eris.Message.prototype.createMessage = function() { return getClient(this).createMessage.apply(getClient(this), [this.channel.id].concat(argsToArray(arguments))); };
    Eris.Message.prototype.delete = function() { return getClient(this).deleteMessage(this.channel.id, this.id); };
    Eris.Channel.prototype.createMessage = function() { return getClient(this).createMessage.apply(getClient(this), [this.id].concat(argsToArray(arguments))); };
    Eris.Channel.prototype.sendTyping = function() { return getClient(this).sendChannelTyping(this.id); };
    Eris.PrivateChannel.prototype.createMessage = function() { return getClient(this).createMessage.apply(getClient(this), [this.id].concat(argsToArray(arguments))); };
    Eris.PrivateChannel.prototype.sendTyping = function() { return getClient(this).sendChannelTyping(this.id); };
}


// (╯°□°）╯︵ ┻━┻ eris object traversing pls
function getClient(channel) {
    if (channel instanceof Eris.Message)
        channel = channel.channel;

    if (channel instanceof Eris.PrivateChannel)
        return client; // must be on the first shard client

    return channel.guild.shard.client;
}


// "borrowed" from babel :&)
function argsToArray(inputArgs) {
    for (var _len = inputArgs.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = inputArgs[_key];
    }

    return args;
}

exports.patch = monkeyPatch;