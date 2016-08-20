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
    }

    get addedMessage() {
        return `Added ${this.provider.prototype.constructor.name} track \`${this.title}\` to the queue.`;
    }

    getStream() {
        if (this.isFile)
            throw new TypeError();

        return this.provider.getStream(this)
            .then(s => {
                this._dateElapse = Date.now(); // store this
                return s;
            });
    }

    getInfo() {
        return this.provider.getTitle(this)
            .then(t => this.title = t)
            .then(() => this.provider.getDuration(this))
            .then(d => this.duration = d);
    }

    get friendlyName() {
        return `\`[${this.provider.prototype.constructor.name}] ~ ${this.title}\` -- requested by \`${this.requester.softMention}\``;
    }

    get secondsIn() {
        return Math.floor((Date.now() - this._dateElapse) / 1000);
    }
}

module.exports = QueueItem;