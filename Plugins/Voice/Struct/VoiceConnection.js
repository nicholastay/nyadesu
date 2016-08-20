"use strict";

const ErisVoiceTransformer = require("eris/lib/util/VolumeTransformer");

class VoiceConnection {
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.queue = [];
        this.nowPlaying = null;

        connection.volumeTransformer = new ErisVoiceTransformer(); // create this in advance so we can set the volume
        connection.setVolume(0.15); // default it to 15% right away

        connection.on("end", this.playNext.bind(this));
    }

    get volume() {
        return this.connection.volumeTransformer.volume;
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
        if (this.nowPlaying.isFile) {
            this.connection.playFile(this.nowPlaying.rawLink, { inlineVolume: true });
        } else {
            this.nowPlaying.getStream()
                .then(strim => this.connection.playStream(strim, { inlineVolume: true }));
        }

        this.textChannel.createMessage(this.nowPlaying.friendlyName);
    }
}

module.exports = VoiceConnection;