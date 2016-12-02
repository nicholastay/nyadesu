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

    static get requiredPermission() {
        return 0;
    }

    static get providerLogoURL() {
        return "http://s.ytimg.com/yts/img/favicon_144-vflWmzoXw.png";
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
        this._ensureProviderData(item);
        let info = item._providerData;
        return info.title && info.author ? `${info.title} (by ${info.author})` : `Video \`<${item.rawLink}>\` [was unable to get metadata]`;
    }

    static getDuration(item) {
        this._ensureProviderData(item);
        return item._providerData.length_seconds;
    }

    static getPreviewImage(item) {
        this._ensureProviderData(item);
        return item._providerData.thumbnail_url;
    }

    static getStream(item) {
        this._ensureProviderData(item);
        let stream = ytdl.downloadFromInfo(item._providerData, { quality: 140 })
            .on("error", e => {
                if (e.code === "ECONNRESET")
                    item.nyaConnection.textChannel.createMessage("❌ Hit a connection error with YouTube... rip.");
                Nyadesu.Logging.warn("Plugin-Voice", `<Youtube> - err: ${e.stack || e}`);
            });

        return Promise.resolve(stream);
    }
}

module.exports = Youtube;