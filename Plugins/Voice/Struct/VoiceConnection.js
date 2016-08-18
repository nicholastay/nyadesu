"use strict";

class VoiceConnection {
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.queue = [];
        this.nowPlaying = null;

        connection.on("end", this.playNext.bind(this));
    }

    addToQueue(item) {
        return item.getInfo()
            .then(() => {
                this.queue.push(item);

                if (this.queue.length === 1) {
                    this.playNext();
                    item.instaPlayed = true;
                }

                return item;
            });
    }

    playNext() {
        if (this.queue.length < 1)
            return this.textChannel.createMessage("We have reached the end of the voice queue, playback has stopped.");

        this.nowPlaying = this.queue.shift();
        if (this.nowPlaying.isFile)
            this.connection.playFile(this.nowPlaying.rawLink, { inlineVolume: true });
        else
            this.connection.playStream(this.nowPlaying.stream, { inlineVolume: true });

        this.textChannel.createMessage(`***Now Playing***: \`[${this.nowPlaying.provider.prototype.constructor.name}] ~ ${this.nowPlaying.title}\` -- requested by ${this.nowPlaying.requester.softMention}`);
    }
}

module.exports = VoiceConnection;