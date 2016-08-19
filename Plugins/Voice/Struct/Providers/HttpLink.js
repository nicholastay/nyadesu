"use strict";

const fetch = require("node-fetch");

const Provider = require("../Provider")
    , Permission = require("../../../../Util/Permission");

const HTTP_LINK_REGEX = /^https?:\/\//;

class HttpLink extends Provider {
    static regexLookup(link) {
        if (!HTTP_LINK_REGEX.test(link))
            return false;

        return link;
    }

    static get isFilePlay() {
        return false;
    }

    static get requiredPermission() {
        return Permission.BOT_ADMIN;
    }

    static getTitle(item) {
        return Promise.resolve(item.rawLink.split("/").pop());
    }

    static getDuration() {
        return Promise.resolve(null);
    }

    static getStream(item) {
        return fetch(item.rawLink)
            .then(r => r.body); // fetch's body is a stream
    }
}

module.exports = HttpLink;