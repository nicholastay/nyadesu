"use strict";

class VoiceConnection {
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
    }
}

module.exports = VoiceConnection;