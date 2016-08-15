"use strict";

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , UserError = require("../../Base/UserError")
    , VoiceConnection = require("./Struct/VoiceConnection");

class Voice extends Plugin {
    constructor() {
        super();

        this.connections = {};
        this.addCommand(new PluginCommand("voice", {
            allowPM: false,
            onReturnSuccess: true
        }, this.joinVoiceCommand.bind(this)));
    }

    joinVoiceCommand(tail, author, channel) {
        if (!tail[0] && !author.voiceState)
            throw new UserError("You must be in a voice channel or specify one for me to join...");

        let vc;
        if (!tail[0] && author.voiceState) {
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
                this.connections[vc.id] = new VoiceConnection(conn, vc, channel);
                return "Successfully joined the voice channel and bound to this text channel.";
            });
    }
}

module.exports = Voice;