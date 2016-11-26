"use strict";

const fetch = require("node-fetch");

const Cache = require("../Cache");

class Gelbooru extends Cache {
    constructor() {
        super();
    }

    getOnline(tag) {
        return fetch("http://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=" + tag)
            .then(r => r.json())
            .then(j => j.map(k => k.file_url));
    }
}

module.exports = Gelbooru;