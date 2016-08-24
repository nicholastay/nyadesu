"use strict";

const ErisVoiceTransformer = require("eris/lib/util/VolumeTransformer");

class VoiceConnection {
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.queue = [];
        this.nowPlaying = null;
        this.autoDisconnect = null; // disconnection timeout

        connection.volumeTransformer = new ErisVoiceTransformer(); // create this in advance so we can set the volume
        connection.setVolume(0.15); // default it to 15% right away

        connection.on("end", () => {
            let res = this.playNext();
            if (!res) {
                // nothing to play, auto d/c
                this.autoDisconnect = setTimeout(() => this.destroy(), 10 * 60 * 60 * 1000); // 10 mins
            } else if (this.autoDisconnect) {
                // clear timeout if there is one
                clearTimeout(this.autoDisconnect);
                this.autoDisconnect = null;
            }
        });
    }

    get volume() {
        return this.connection.volumeTransformer.volume;
    }

    destroy() {
        Nyadesu.Client.leaveVoiceChannel(this.voiceChannel.id);
        delete(Nyadesu.Plugins.Voice.handler.connections[this.textChannel.guild.id]);
    }

    addToQueue(item) {
        return item.getInfo()
            .then(() => {
                this.queue.push(item);

                if (!this.nowPlaying) {
                    this.playNext();
                    item.instaPlayed = true;
                }

                return item;
            });
    }

    playNext() {
        if (this.queue.length < 1) {
            this.nowPlaying = null;
            this.textChannel.createMessage("We have reached the end of the voice queue, playback has stopped.");
            return false;
        }

        this.nowPlaying = this.queue.shift();
        if (this.nowPlaying.isFile) {
            this.connection.playFile(this.nowPlaying.rawLink, { inlineVolume: true });
        } else {
            this.nowPlaying.getStream()
                .then(strim => this.connection.playStream(strim, { inlineVolume: true }));
        }

        this.textChannel.createMessage("***Now Playing***: " + this.nowPlaying.friendlyName);
        return true;
    }
}

module.exports = VoiceConnection;


// full on ghetto but makes it cleaner - i should devise a better way to do this
