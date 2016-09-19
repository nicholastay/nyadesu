"use strict";

class Provider {
    static getInfo() {
        return Promise.resolve();
    }

    static getFileLink(item) {
        return Promise.resolve(item.rawLink);
    }

    static _ensureProviderData(item) {
        if (!item._providerData)
            throw new Error("no provider data z.z");
    }
}

module.exports = Provider;