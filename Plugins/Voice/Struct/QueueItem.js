"use strict";

class QueueItem {
    constructor(conn, options) {
        this.nyaConnection = conn;

        this.requester = options.requester;
        this.provider = options.provider;
        this.rawLink = options.rawLink;

        this._providerData = null;
        this.title = null;
        this.duration = null;
        this.previewImageURL = null;
        this._dateElapse = null; // used to track how much time elapsed

        this.isFile = this.provider.isFilePlay;

        this.voteSkip = null; // vote skipping
    }

    get addedMessage() {
        // return `Added ${this.provider.prototype.constructor.name} track \`${this.title}\` to the queue.`;

        return {
            url: this.rawLink.startsWith("http") ? this.rawLink : undefined,
            author: {
                name: `${this.title} - ${this.provider.prototype.constructor.name}`,
                icon_url: this.provider.providerLogoURL
            },
            thumbnail: {
                url: this.previewImageURL
            },
            description: "powered by nyadesu Voice",
            fields: [
                {
                    name: "Status",
                    value: "Added to Queue",
                    inline: true
                },
                {
                    name: "Duration",
                    value: this.duration ? `${Math.floor(this.duration/60)}m ${this.duration-(Math.floor(this.duration/60)*60)}s` : "Unknown",
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: `requested by ${this.requester.softMention}`,
                icon_url: this.requester.avatarURL
            }
        };
    }

    getPlay() {
        let fun = this.isFile ? this.provider.getFileLink(this) : this.provider.getStream(this);

        return fun
            .then(s => {
                this._dateElapse = Date.now(); // store
                return s;
            });
    }

    getInfo() {
        return this.provider.getInfo(this)
            .then(() => {
                this.title = this.provider.getTitle(this);
                this.duration = this.provider.getDuration(this);
                this.previewImageURL = this.provider.getPreviewImage(this);
            });
    }

    get friendlyName() {
        return `\`[${this.provider.prototype.constructor.name}] ~ ${this.title}\` -- requested by \`${this.requester.softMention}\``;
    }

    get secondsIn() {
        return Math.floor((Date.now() - this._dateElapse) / 1000);
    }
}

module.exports = QueueItem;