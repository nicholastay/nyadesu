"use strict";

class VoiceConnection {
    constructor(plugin, connection, voiceChannel, textChannel) {
        this.plugin = plugin;
        this.connection = connection;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;

        this.queue = [];
        this.nowPlaying = null;
        this.autoDisconnect = null; // disconnection timeout
        this._setIdleTimeout();

        this._volume = 0.15; // default it to 15% right away

        connection.on("end", () => {
            let res = this.playNext();
            if (!res) {
                // nothing to play, auto d/c
                this._setIdleTimeout();
            } else if (this.autoDisconnect) {
                // clear timeout if there is one
                this.plugin._clearTimeout(this.autoDisconnect);
                this.autoDisconnect = null;
            }
        });
    }

    get volume() { return this._volume; }
    set volume(v) {
        this._volume = v;
        if (this.nowPlaying)
            this.connection.setVolume(v);
    }

    _setIdleTimeout() {
        this.autoDisconnect = this.plugin._setTimeout(() => {
            this.textChannel.createMessage("It has been 10 minutes, auto-leaving the voice channel, good bye...");
            this.destroy();
        }, 10 * 60 * 1000); // 10 mins
    }

    destroy() {
        if (this.autoDisconnect)
            this.plugin._clearTimeout(this.autoDisconnect);
        
        return Nyadesu.Client.leaveVoiceChannel(this.voiceChannel.id)
            .then(() => delete(Nyadesu.Plugins.Voice.handler.connections[this.textChannel.guild.id]));
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
        this.nowPlaying.getPlay()
            .then(resource => this.connection.play(resource, { inlineVolume: true }))
            .then(() => this.connection.setVolume(this.volume))
            .then(() => this.textChannel.createMessage("***Now Playing***: " + this.nowPlaying.friendlyName));
        
        return true;
    }
}

module.exports = VoiceConnection;