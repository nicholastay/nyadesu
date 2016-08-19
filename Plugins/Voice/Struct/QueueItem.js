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

        this.isFile = this.provider.isFilePlay;
    }

    get addedMessage() {
        return `Added ${this.provider.prototype.constructor.name} track \`${this.title}\` to the queue.`;
    }

    getStream() {
        if (this.isFile)
            throw new TypeError();

        return this.provider.getStream(this);
    }

    getInfo() {
        return this.provider.getTitle(this)
            .then(t => this.title = t)
            .then(() => this.provider.getDuration(this))
            .then(d => this.duration = d);
    }
}

module.exports = QueueItem;