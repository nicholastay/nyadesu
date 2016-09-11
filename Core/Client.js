"use strict";

const Eris = require("eris");

class Client extends Eris {
    static get configDefaults() {
        return {
            token: "DISCORD_TOKEN_HERE",
            prefix: "!"
        };
    }

    constructor() {
        let token = Nyadesu.Config.Client.token;
        super(token);
        
        this.on("ready", () => Nyadesu.Events.emit("client.ready"));
        this.on("disconnect", () => Nyadesu.Events.emit("client.disconnect"));
        this.on("messageCreate", m => Nyadesu.Events.emit("client.message", m));

        // patch
        erisPatch(this);

        Nyadesu.Logging.success("Client", "Loaded Eris client + slight OOP patched.");
    }
}

module.exports = Client;


function erisPatch(client) {
    // generic patches
    // eris doesnt have these, add for convenience
    Eris.Message.prototype.createMessage = function(content, file) { return client.createMessage(this.channel.id, content, file); };


    // non generic patches
    // user#discrim getterl
    Object.defineProperty(Eris.User.prototype, "softMention", { get: function() { return `${this.username}#${this.discriminator}`; } });
    Object.defineProperty(Eris.Member.prototype, "softMention", { get: function() { return `${this.user.username}#${this.user.discriminator}`; } });

    // reply/softReply
    client.replyMessage = (message, content, file) =>
        client.createMessage(message.channel.id, (message.channel instanceof Eris.PrivateChannel) ? content : `${message.author.mention}: ${content}`, file);
    client.softReplyMessage = (message, content, file) =>
        client.createMessage(message.channel.id, (message.channel instanceof Eris.PrivateChannel) ? content : `\`${message.author.softMention}\`: ${content}`, file);

    // prototypes for our reply/softReply
    Eris.Message.prototype.reply = function(content, file) { return client.replyMessage(this, content, file); };
    Eris.Message.prototype.softReply = function(content, file) { return client.softReplyMessage(this, content, file); };
}