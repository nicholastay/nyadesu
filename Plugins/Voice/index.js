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

        if (Nyadesu.Client.voiceConnections.size > 0) // cleanup stales
            Nyadesu.Client.voiceConnections.forEach((val, key) =>
                Nyadesu.Client.leaveVoiceChannel(key));

        this.connections = {};
        this.providers = {};

        for (let p of fs.readdirSync(PROVIDERS_PATH)) {
            let pName = p.replace(".js", "");
            let prov = require(path.join(PROVIDERS_PATH, p));

            if (prov.checkCompatibility && !prov.checkCompatibility())
                continue;
            
            this.providers[pName] = prov;
        }

        this.addEventHandler("commandhandler", "client.disconnect", () => {
            this.connections = {};
        });

        this.addCommand(new PluginCommand("voice", {
            allowPM: false,
            onReturnSuccess: true,
            softReply: true
        }, this.voiceCommand.bind(this)));

        this.addCommand(new PluginCommand("togglevoice", {
            allowPM: false,
            softReply: true,
            permission: Permission.BOT_ADMIN,
            onReturnSuccess: true
        }, this.toggleVoiceCommand.bind(this)));

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

        this.addCommand(new PluginCommand("np", {
            allowPM: false
        }, this.nowPlayingCommand.bind(this)));

        this.addCommand(new PluginCommand("queue", {
            allowPM: false
        }, this.queueCommand.bind(this)));

        this.addCommand(new PluginCommand("volume", {
            allowPM: false,
            reply: true
        }, this.volumeCommand.bind(this)));
    }

    voiceCommand(tail, author, channel) {
        if (!Nyadesu.SettingsManager.getSetting(channel.guild.id, "voice_allowed"))
            throw new UserError(`This server is not allowed to use voice functionality, as it is very resource and bandwidth heavy. Please ask my owner for instructions if you insist.`);

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

    toggleVoiceCommand(tail, author, channel) {
        let status = Nyadesu.SettingsManager.getSetting(channel.guild.id, "voice_allowed");

        return Nyadesu.SettingsManager.editSetting(channel.guild.id, "voice_allowed", status ? false : true)
            .then(() => `${status ? "Disallowed" : "Allowed"} voice functionality to be used on this server.`);
    }

    playCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        let tailJoin = tail.join(" ");

        let lookup, provider;
        const doLast = ["HttpLink"]; // do these last as these are to cover a broader scope, do more specific regexs first
        for (let p in this.providers) {
            if (doLast.indexOf(p) >= 0)
                continue;

            lookup = this.providers[p].regexLookup(tailJoin);
            if (lookup) {
                provider = this.providers[p];
                break;
            }
        }

        // TODO: somehow not copypasta this pls
        if (!lookup) {
            for (let p of doLast) {
                lookup = this.providers[p].regexLookup(tailJoin);
                if (lookup) {
                    provider = this.providers[p];
                    break;
                }
            }
        }

        if (!lookup)
            throw new UserError("Invalid source of input to play from...");

        if ((lookup.requiredPermission || Permission.NONE) !== Permission.NONE) {
            if (!Nyadesu.Permissions.hasPermission(author, channel.guild, lookup.requiredPermission))
                throw new UserError("You do not have permission to use this playback source...");
        }

        return connection.addToQueue(new QueueItem(connection, {
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

    nowPlayingCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        if (!connection.nowPlaying)
            throw new UserError("There is no track currently playing in this server...");

        let r = "***Now Playing***: " + connection.nowPlaying.friendlyName;
        if (connection.nowPlaying.duration) {
            const duration = connection.nowPlaying.duration
                , elapsed = connection.nowPlaying.secondsIn;

            // MAX duration
            let minutes = Math.floor(duration / 60)
              , _seconds = duration - (minutes * 60)
              , seconds = _seconds.toString().length === 1 ? `0${_seconds}` : _seconds; // pad 0

            // ELAPSED duration
            let eMinutes = Math.floor(elapsed / 60)
              , _eSeconds = elapsed - (eMinutes * 60)
              , eSeconds = _eSeconds.toString().length === 1 ? `0${_eSeconds}` : _eSeconds; // pad 0;

            let barsFilled = Math.round((elapsed / duration) * 15) - 1 // over 15 bars and -1 because circle in the middle
              , barsBlank = 15 - barsFilled;

            r += `
>> **${"-".repeat(barsFilled)}o**${"-".repeat(barsBlank)} \`${eMinutes}:${eSeconds}/${minutes}:${seconds}\``;
        }

        return r;
    }

    volumeCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        if (!tail[0])
            return `The volume is currently set at: ${connection.volume * 100}%.`;

        if (!Nyadesu.Permissions.hasPermission(author, channel.guild, Permission.SERVER_MOD))
            throw new UserError("You do not have permission to change the volume.");

        let vol = Number(tail[0].replace("%", ""));
        if (isNaN(vol) || vol < 0 || vol > 200)
            throw new UserError("Invalid volume, should be a number as a percentage between 0-200%, with or without a % sign...");

        connection.connection.setVolume(vol / 100);
        return `✅ The volume is now set to: ${connection.volume * 100}%.`;
    }

    queueCommand(tail, author, channel) {
        let connection = this._ensureConnection(channel);

        if (!connection.nowPlaying)
            throw new UserError("There are no tracks currently queued in this server...");

        let r = `**>> Queue for ${connection.voiceChannel.name} <<**`;
        r += `\n**NP**: ` + connection.nowPlaying.friendlyName;

        if (connection.queue.length > 0) {
            let i = 1;
            for (let itm of connection.queue) {
                r += `\n**${i}:** ${itm.friendlyName}`; // < 10 pad
                i++;
            }
        }
        
        return r;
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