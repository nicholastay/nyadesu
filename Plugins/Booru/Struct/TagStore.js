"use strict";

class TagStore {
    constructor(tagExpiry, urls) {
        this.tagExpiry = Date.now() + tagExpiry;
        this.urls = urls;
    }

    get() {
        if (Date.now() > this.tagExpiry)
            return false;

        return this.urls[Math.floor(Math.random() * this.urls.length)];
    }
}

module.exports = TagStore;