"use strict";

const RateLimiter = require("limiter").RateLimiter
    , eris = require("eris");

class Ratelimiting {
    constructor() {
        this.buckets = {
            global: {},
            perUser: {},
            perServer: {}
        };
    }

    tryRemoveToken(bucketObj, obj) {
        let bucket;

        if (bucketObj.mode === "global") {
            if (!this.buckets[bucketObj.name])
                this.buckets[bucketObj.name] = new RateLimiter(bucketObj.requests, bucketObj.limit);
            bucket = this.buckets[bucketObj.name];
        }
        else if (bucketObj.mode === "perUser" || bucketObj.mode === "perServer") {
            if (!obj instanceof eris.User || !obj instanceof eris.Member || !obj instanceof eris.Guild)
                throw new Error("wrong obj, should be user or guild -- " + bucketObj.mode);

            if (!this.buckets[bucketObj.mode][obj.id])
                this.buckets[bucketObj.mode][obj.id] = {};

            if (!this.buckets[bucketObj.mode][obj.id][bucketObj.name])
                this.buckets[bucketObj.mode][obj.id][bucketObj.name] = new RateLimiter(bucketObj.requests, bucketObj.limit);
            bucket = this.buckets[bucketObj.mode][obj.id][bucketObj.name];
        }

        return bucket.tryRemoveTokens(1);
    }
}

module.exports = Ratelimiting;