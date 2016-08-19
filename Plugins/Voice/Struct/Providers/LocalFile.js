"use strict";

const path = require("path");

const Provider = require("../Provider");

class LocalFile extends Provider {
    static regexLookup(link) {
        if (!link.startsWith("$f:"))
            return false;

        return link.replace("$f:", "");
    }

    static get isFilePlay() {
        return true;
    }

    static get requiredPermission() {
        return 0;
    }

    static getTitle(item) {
        return Promise.resolve(item.rawLink.split(path.sep).pop());
    }

    static getDuration() {
        return Promise.resolve(null);
    }
}

module.exports = LocalFile;