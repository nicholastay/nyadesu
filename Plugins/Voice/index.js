"use strict";

const fs = require("fs")
    , path = require("path");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , UserError = require("../../Base/UserError")
    , Permission = require("../../Util/Permission")
    , VoiceConnection = require("./Struct/VoiceConnection")
    , QueueItem = require("./Struct/QueueItem");

const PROVIDERS_PATH = path.join(__dirname, "Struct", "Providers");

class Voice extends Plugin {
    constructor() {
        super();

        this.connections = {};
        this.providers = {};

        for (let p of fs.readdirSync(PROVIDERS_PATH)) {
            let pName = p.replace(".js", "");
            this.providers[pName] = require(path.join(PROVIDERS_PATH, p));
        }

        this.addCommand(new PluginCommand("voice", {
            allowPM: false,
            onReturnSuccess: true,
            softReply: true
        }, this.voiceCommand.bind(this)));

        this.addCommand(new PluginCommand("play", {
            allowPM: false,
            reply: true,
            requireInput: 1
        }, this.playCommand.bind(this)));

        this.addCommand(new PluginCommand("fstop", {
            allowPM: false,
            softReply: true,
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true
        }, this.forceStopCommand.bind(this)));
    }

    voiceCommand(tail, author, channel) {
        if (this.connections[channel.guild.id]) {
            if (this.connections[channel.guild.id].textChannel.id === channel.id) {
                Nyadesu.Client.leaveVoiceChannel(this.connections[channel.guild.id].voiceChannel.id);
                delete(this.connections[channel.guild.id]);
                return "Successfully left the voice channel and unbound.";
            }
            
            throw new UserError(`There is already a voice connection in this server and the text channel is bound in ${this.connections[channel.guild.id].textChannel.mention}.`);
        }

        let vc;
        if (!tail[0]) {
            if (!author.voiceState)
                throw new UserError("You must be in a voice channel or specify one for me to join...");

            vc = channel.guild.channels.find(c => c.id === author.voiceState.channelID);
            if (!vc)
                throw new UserError("The voice channel you are currently in is not in this server...");
        } else {
            vc = channel.guild.channels.find(c => c.type === 2 && c.name === tail.join(" "));
            if (!vc)
                throw new UserError("Invalid voice channel for me to join...");
        }

        return Nyadesu.Client.joinVoiceChannel(vc.id)
            .then(conn => {
                this.connections[channel.guild.id] = new VoiceConnection(conn, vc, channel);
                return "Successfully joined the voice channel and bound to this text channel.";
            });
    }

    playCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        let tailJoin = tail.join(" ");

        let lookup, provider;
        for (let p in this.providers) {
            lookup = this.providers[p].regexLookup(tailJoin);
            if (lookup) {
                provider = this.providers[p];
                break;
            }
        }

        if (!lookup)
            throw new UserError("Invalid source of input to play from...");

        if ((lookup.requiredPermission || Permission.NONE) !== Permission.NONE) {
            if (!Nyadesu.Permissions.hasPermission(author, channel.guild, lookup.requiredPermission))
                throw new UserError("You do not have permission to use this playback source...");
        }

        return connection.addToQueue(new QueueItem(this, {
            requester: author,
            provider: provider,
            rawLink: lookup
        })).then(item => {
            if (!item.instaPlayed)
                return item.addedMessage;
            return null;
        });
    }

    forceStopCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        if (!connection.nowPlaying)
            throw new UserError("There is no track currently playing in this server...");

        connection.connection.stopPlaying();
        return "Stopped the current playing track.";
    }

    _ensureConnection(channel) {
        if (!this.connections[channel.guild.id])
            throw new UserError("There is no voice connection currently present in this server...");

        if (this.connections[channel.guild.id].textChannel.id !== channel.id)
            throw new UserError(`There is already a voice connection present in this server, but it is bound to another text channel (${this.connections[channel.guild.id].textChannel.mention}).`);

        return this.connections[channel.guild.id];
    }
}

module.exports = Voice;