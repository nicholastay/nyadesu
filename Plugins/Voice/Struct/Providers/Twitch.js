"use strict";

const cpoc = require("child_process");

const Provider = require("../Provider")
    , Permission = require("../../../../Util/Permission");

const TWITCH_REGEX = /twitch\.tv\/([a-zA-Z0-9]\w{3,24})/i; // based off twitch's username requirements as well

// once again based off my own meowbot & discord.js 8.x audioencoder
class Twitch extends Provider {
    static regexLookup(link) {
        let reg = TWITCH_REGEX.exec(link);
        if (!reg)
            return false;

        return "twitch.tv/" + reg[1];
    }

    static checkCompatibility() {
        let c = cpoc.spawnSync("livestreamer");
        if (c.error)
            return false;
        return true;
    }

    static get isFilePlay() {
        return false;
    }

    static get requiredPermission() {
        return Permission.BOT_FRIEND;
    }

    static getTitle(item) {
        return item.rawLink;
    }

    static getDuration() {
        return null;
    }

    static getStream(item) {
        return new Promise(resolve => {
            Nyadesu.Logging.log("Voice-Twitch", `${item.requester.softMention} requested twitch stream of: ${item.rawLink}, spawning livestreamer for them.`);
            let lsproc = cpoc.spawn("livestreamer", [
                "-O", // stdout
                "-Q", // quiet mode
                item.rawLink,
                "audio" // audio only stream
            ]);

            item._providerData = { // store this metadata here
                lsproc,
                killed: false
            };

            // readable fire
            lsproc.stdout.once("readable", () => {
                Nyadesu.Logging.log("Voice-Twitch", "Livestreamer should be ready to go, resolving and playing.");
                resolve(lsproc.stdout);
            });

            // end kill processes and stuff
            lsproc.stdout.once("end", () => processCleanup(item));
            lsproc.stdout.once("error", e => processCleanup(item, e));

            // ensure the process is killed when it is stopped in eris
            item.nyaConnection.connection.once("end", () => processCleanup(item));
        });
    }
}


function processCleanup(item, err) {
    if (item._providerData.killed)
        return;

    if (err)
        Nyadesu.Logging.warn("Voice-Twitch", `Error with twitch audio stream: ${item.rawLink} -- ${err.stack || err}`);
    Nyadesu.Logging.log("Voice-Twitch", `Cleaning up processes for twitch stream: ${item.rawLink}.`);

    item._providerData.lsproc.kill("SIGKILL");
    item._providerData.killed = true;
}


module.exports = Twitch;