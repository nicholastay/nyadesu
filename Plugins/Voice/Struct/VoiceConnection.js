"use strict";

class VoiceConnection {
    constructor(connection, voiceChannel, textChannel) {
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.queue = [];
        this.nowPlaying = null;
        this.autoDisconnect = null; // disconnection timeout

        this.volume = 0.15; // default it to 15% right away

        connection.on("end", () => {
            let res = this.playNext();
            if (!res) {
                // nothing to play, auto d/c
                this.autoDisconnect = setTimeout(() => this.destroy(), 10 * 60 * 1000); // 10 mins
            } else if (this.autoDisconnect) {
                // clear timeout if there is one
                clearTimeout(this.autoDisconnect);
                this.autoDisconnect = null;
            }
        });
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
        let p = this.nowPlaying.isFile ? Promise.resolve(this.nowPlaying.rawLink) : this.nowPlaying.getStream();
        
        p
            .then(resource => this.connection.play(resource, { inlineVolume: true }))
            .then(() => this.connection.setVolume(this.volume))
            .then(() => this.textChannel.createMessage("***Now Playing***: " + this.nowPlaying.friendlyName));
        
        return true;
    }
}

module.exports = VoiceConnection;