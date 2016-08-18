"use strict";

const ytdl = require("ytdl-core");

const Provider = require("../Provider");

const YOUTUBE_REGEX = /youtu(?:be\.com\/watch\?v=|\.be\/)[A-Za-z0-9-_]+/i;

class Youtube extends Provider {
    static regexLookup(link) {
        let reg = YOUTUBE_REGEX.exec(link);
        if (!reg)
            return false;

        return "http://www." + reg[0];
    }

    static get isFilePlay() {
        return false;
    }

    static getInfo(item) {
        return new Promise((resolve, reject) => {
            ytdl.getInfo(item.rawLink, (err, info) => {
                if (err)
                    reject(err);

                item._providerData = info;
                resolve(info);
            });
        });
    }

    static getTitle(item) {
        let prom;
        if (!this._providerData)
            prom = this.getInfo(item);
        else
            prom = Promise.resolve(this._providerData);

        return prom.then(info => info.title && info.author ? `${info.title} (by ${info.author})` : `Video \`<${item.rawLink}>\` [was unable to get metadata]`);
    }

    static getDuration(item) {
        let prom;
        if (!this._providerData)
            prom = this.getInfo(item);
        else
            prom = Promise.resolve(this._providerData);

        return prom.then(info => info.length_seconds);
    }

    static getStream(item) {
        if (!item._providerData)
            return new Error("no provider data z.z");

        return ytdl.downloadFromInfo(item._providerData, { quality: 140 })
            .on("error", e => {
                if (e.code === "ECONNRESET")
                    item.nyaConnection.textChannel.createMessage("❌ Hit a connection error with YouTube... rip.");
                Nyadesu.Logging.warn("Plugin-Voice", `<Youtube> - err: ${e.stack || e}`);
            });
    }
}

module.exports = Youtube;