"use strict";

const Eris = require("eris");

const ErisMonkeypatch = require("../Util/ErisMonkeypatch");

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
        this.on("messageCreate", m => Nyadesu.Events.emit("client.message", m));

        // patch
        ErisMonkeypatch.patch(this);
        otherErisPatches();
        Nyadesu.Logging.success("Client", "Loaded Eris client + slight OOP patched.");
    }

    replyMessage(message, content, file) {
        this.createMessage(message.channel.id, `${message.author.mention} ${content}`, file);
    }

    softReplyMessage(message, content, file) {
        this.createMessage(message.channel.id, `\`${message.author.softMention}\`: ${content}`, file);
    }
}

module.exports = Client;


function otherErisPatches() {
    // non generic patches

    // user#discrim getterl
    Object.defineProperty(Eris.User.prototype, "softMention", { get: function() { return `${this.username}#${this.discriminator}`; } });

    // prototypes for our reply/softReply
    Eris.Message.prototype.reply = function(content, file) { return Nyadesu.Client.replyMessage(this.channel.id, content, file); };
    Eris.Message.prototype.softReply = function(content, file) { return Nyadesu.Client.softReplyMessage(this.channel.id, content, file); };
}