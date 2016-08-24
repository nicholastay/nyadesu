"use strict";

const Eris = require("eris");

const ErisMonkeypatch = require("../Util/eris-ooppatch/patch");

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
        ErisMonkeypatch.patch(this);
        otherErisPatches();

        // reply thingies
        this.replyMessage = (message, content, file) =>
            this.createMessage(message.channel.id, (message.channel instanceof Eris.PrivateChannel) ? content : `${message.author.mention}: ${content}`, file);
        this.softReplyMessage = (message, content, file) =>
            this.createMessage(message.channel.id, (message.channel instanceof Eris.PrivateChannel) ? content : `\`${message.author.softMention}\`: ${content}`, file);

        Nyadesu.Logging.success("Client", "Loaded Eris client + slight OOP patched.");
    }
}

module.exports = Client;


function otherErisPatches() {
    // non generic patches

    // user#discrim getterl
    Object.defineProperty(Eris.User.prototype, "softMention", { get: function() { return `${this.username}#${this.discriminator}`; } });
    Object.defineProperty(Eris.Member.prototype, "softMention", { get: function() { return `${this.user.username}#${this.user.discriminator}`; } });

    // prototypes for our reply/softReply
    Eris.Message.prototype.reply = function(content, file) { return Nyadesu.Client.replyMessage(this, content, file); };
    Eris.Message.prototype.softReply = function(content, file) { return Nyadesu.Client.softReplyMessage(this, content, file); };
}