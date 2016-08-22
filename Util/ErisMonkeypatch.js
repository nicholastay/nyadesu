"use strict";

const Eris = require("eris");

let firstClient = null;
function monkeyPatch(fClient) {
    firstClient = fClient;

    Eris.Message.prototype.createMessage = function() { return clientFuncArgs(this, "createMessage", [this.channel.id], arguments); };
    Eris.Message.prototype.delete = function() { return clientFuncArgs(this, "deleteMessage", [this.channel.id, this.id]); };
    Eris.Channel.prototype.createMessage = function() { return clientFuncArgs(this, "createMessage", [this.id], arguments); };
    Eris.Channel.prototype.sendTyping = function() { return clientFuncArgs(this, "sendChannelTyping", [this.id]); };
    Eris.PrivateChannel.prototype.createMessage = function() { return clientFuncArgs(this, "createMessage", [this.id], arguments); };
    Eris.PrivateChannel.prototype.sendTyping = function() { return clientFuncArgs(this, "sendChannelTyping", [this.id]); };
}


function clientFuncArgs(self, funcName, prependArgs, args) {
    let client = getClient(self);
    if (!args)
        return client[funcName].apply(client, prependArgs);

    return client[funcName].apply(client, prependArgs.concat(argsToArray(args)));
}


// (╯°□°）╯︵ ┻━┻ eris object traversing pls
function getClient(channel) {
    if (channel instanceof Eris.Message)
        channel = channel.channel;

    if (channel instanceof Eris.PrivateChannel)
        return firstClient; // must be on the first shard client

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