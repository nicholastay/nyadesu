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
        this._dateElapse = null; // used to track how much time elapsed

        this.isFile = this.provider.isFilePlay;

        this.voteSkip = null; // vote skipping
    }

    get addedMessage() {
        return `Added ${this.provider.prototype.constructor.name} track \`${this.title}\` to the queue.`;
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