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
            .then(() => this.textChannel.createMessage({
                embed: {
                    color: 4446457,
                    url: this.nowPlaying.rawLink.startsWith("http") ? this.rawLink : undefined,
                    author: {
                        name: `${this.nowPlaying.title} - ${this.nowPlaying.provider.prototype.constructor.name}`,
                        icon_url: this.nowPlaying.provider.providerLogoURL
                    },
                    thumbnail: {
                        url: this.nowPlaying.previewImageURL
                    },
                    description: "powered by nyadesu Voice",
                    fields: [
                        {
                            name: "Status",
                            value: "Now Playing",
                            inline: true
                        },
                        {
                            name: "Duration",
                            value: this.nowPlaying.duration ? `${Math.floor(this.nowPlaying.duration/60)}m ${this.nowPlaying.duration-(Math.floor(this.nowPlaying.duration/60)*60)}s` : "Unknown",
                            inline: true
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `requested by ${this.nowPlaying.requester.softMention}`,
                        icon_url: this.nowPlaying.requester.avatarURL
                    }
                }
            }));
        
        return true;
    }
}

module.exports = VoiceConnection;