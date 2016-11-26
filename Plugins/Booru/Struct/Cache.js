"use strict";

const TagStore = require("./TagStore");

class Cache {
    constructor(tagExpiry, tagLimit) {
        this.tagExpiry = tagExpiry || 10 * 60 * 1000; // 10 min default
        this.tagLimit = tagLimit || 35; // 35 tags default

        this.tags = {};
    }

    store(tag, urls) {
        let tagKeys = Object.keys(this.tags);
        if (tagKeys.length+1 > this.tagLimit)
            delete this.tags[tagKeys[0]];

        this.tags[tag] = new TagStore(this.tagExpiry, urls);
    }

    getOnline(/* tag */) {} // this should be overrided & return a promise of url array

    _getOnline(tag) {
        return this.getOnline(tag)
            .then(urls => this.store(tag, urls))
            .then(() => this.tags[tag].get());
    }

    get(tag) {
        let p;
        if (!this.tags[tag]) {
            p = this._getOnline(tag);
        } else {
            let url = this.tags[tag].get();
            if (url === false) {
                delete this.tags[tag]; // expired
                p = this._getOnline(tag);
            } else {
                p = Promise.resolve(url);
            }
        }

        return p;
    }
}

module.exports = Cache;