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
        return true;
    }

    static get requiredPermission() {
        return Permission.BOT_FRIEND;
    }

    static getTitle(item) {
        return Promise.resolve(item.rawLink.split("/").pop());
    }

    static getDuration() {
        return Promise.resolve(null);
    }
}

module.exports = HttpLink;