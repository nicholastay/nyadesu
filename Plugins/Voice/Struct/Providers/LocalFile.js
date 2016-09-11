"use strict";

const path = require("path")
    , cpoc = require("child_process");

const Provider = require("../Provider");

// check ffprobe capabilities
let ffprobable = false;
if (!cpoc.spawnSync("ffprobe").error)
    ffprobable = true;

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

    static getDuration(item) {
        if (!ffprobable)
            return Promise.resolve(null);

        try {
            let c = cpoc.spawnSync("ffprobe", [
                "-v", "quiet", // dont print garbage output at start
                "-print_format", "json", // json data
                "-show_format", // actually get the format data
                item.rawLink
            ]);

            if (c.error)
                return Promise.resolve(null);

            let rawData = c.stdout.toString() || c.stderr.toString(); // windows goes to stderr
            let data = JSON.parse(rawData);
            if (data && data.format && data.format.duration)
                return Promise.resolve(Math.round(Number(data.format.duration))); // we just want a solid round integer
            return Promise.resolve(null);
        }
        catch (e) {
            return Promise.resolve(null);
        }
    }
}

module.exports = LocalFile;