"use strict";

const fetch = require("node-fetch");

const Provider = require("../Provider");

const SNDCLD_REGEX = /(snd\.sc\/[a-zA-Z0-9]+|soundcloud\.com\/[a-zA-Z0-9\-\.]+\/[a-zA-Z0-9\-\.]+)/i;

class Soundcloud extends Provider {
    static regexLookup(link) {
        let reg = SNDCLD_REGEX.exec(link);
        if (!reg)
            return false;

        return "http://" + reg[0];
    }

    static checkCompatibility() {
        if (Nyadesu.Config.Plugin.Voice.soundcloudClientId)
            return true;
        return false;
    }

    static get isFilePlay() {
        return true;
    }

    static getInfo(item) {
        return fetch(`http://api.soundcloud.com/resolve?url=${item.rawLink}&client_id=${Nyadesu.Config.Plugin.Voice.soundcloudClientId}`)
            .then(r => r.json())
            .then(d => {
                if (d.errors)
                    throw new Error("Invalid SoundCloud link or currently having problems reaching SoundCloud. :<");
                if (!d.streamable || !d.stream_url)
                    throw new Error("SoundCloud doesn't seem to want to allow me to play this track. Maybe try a different track or try again later. :(");

                item._providerData = d;
                return d;
            });
    }

    static getTitle(item) {
        this._ensureProviderData(item);
        return `${item._providerData.title} (by ${item._providerData.user.username})`;
    }

    static getDuration(item) {
        this._ensureProviderData(item);
        return Math.round(Number(item._providerData.duration) / 1000); // sndcld gives duration in ms, we just need in s
    }

    static getFileLink(item) {
        this._ensureProviderData(item);

        // need to follow the redir first as ffmpeg doesnt seem to allow us to do that
        return fetch(`${item._providerData.stream_url}?client_id=${Nyadesu.Config.Plugin.Voice.soundcloudClientId}`, {
            redirect: "manual" // just get the header to where its going.
        }).then(r => r.headers.get("location")); // location header = redir location.
    }
}

module.exports = Soundcloud;