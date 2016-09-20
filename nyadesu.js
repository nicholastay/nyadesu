"use strict";

const fs = require("fs")
    , path = require("path");

global.Promise = require("bluebird");

class Nyadesu {
    start() {
        if (global.Nyadesu)
            throw new Error("An instance of nyadesu is already running in this process, please stop then reload.");
        global.Nyadesu = this;
        this.version = require("./package.json").version;

        console.log("-------------------");
        console.log(`nyadesu, v${this.version}`);
        console.log("-------------------");
        console.log("");

        this.alive = false;
        this.scriptStart = Date.now();

        this.loadCore();
        this.Plugins._loadIndexed();
        this.Client.connect();

        this.Logging.success("Nyadesu", "Loaded core modules.");
        this.Events.emit("nyadesu.loaded");

        // temp
        this.Events.on("client.ready", () => {
            this.alive = true;
            this.Logging.success("Client", "Ready / in.");
            this.Client.editStatus(false, {
                name: `<nyadesu v${this.version}>`
            });
        });
        this.Events.on("client.disconnect", () => {
            this.alive = false;
            this.Logging.warn("Client", "Disconnected, will try auto-reconnect...");
        });
    }

    loadCore() {
        this.corePath = path.join(__dirname, "Core");
        this._loadedCores = [];

        const priorityLoads = ["Logging", "Plugins", "Config", "Database", "Events"]
            , corePlugins = fs.readdirSync(this.corePath).map(c => c.replace(".js", ""));
        for (let p of priorityLoads.concat(corePlugins)) {
            if (this._loadedCores.indexOf(p) >= 0)
                continue;

            let coreP = require(path.join(this.corePath, p));
            this[p] = new coreP();
            this._loadedCores.push(p);
        }

        this.Logging.success("Nyadesu", `Loaded ${this._loadedCores.length} core(s). [${this._loadedCores.join(", ")}]`);
    }

    stop() {
        global.Nyadesu = undefined;
    }

    get scriptUptime() {
        return Date.now() - this.scriptStart;
    }
}

(new Nyadesu()).start();