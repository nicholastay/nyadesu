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
            onReturnSuccess: true,
            softReply: true
        }, this.voiceCommand.bind(this)));
    }

    voiceCommand(tail, author, channel) {
        if (this.connections[channel.guild.id]) {
            if (this.connections[channel.guild.id].textChannel.id === channel.id) {
                return Nyadesu.Client.leaveVoiceChannel(this.connections[channel.guild.id].voiceChannel.id)
                    .then(() => "Successfully left the voice channel and unbound.");
            } else {
                throw new UserError(`There is already a voice connection in this server and the text channel is bound in ${this.connections[channel.guild.id].textChannel.mention}.`);
            }
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
}

module.exports = Voice;