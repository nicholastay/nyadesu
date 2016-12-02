"use strict";

class Provider {
    static get providerLogoURL() {
        return "https://i.imgur.com/VBGKhNO.png";
    }

    static getInfo() {
        return Promise.resolve();
    }

    static getFileLink(item) {
        return Promise.resolve(item.rawLink);
    }

    static getPreviewImage() {
        return Promise.resolve(undefined);
    }

    static _ensureProviderData(item) {
        if (!item._providerData)
            throw new Error("no provider data z.z");
    }
}

module.exports = Provider;