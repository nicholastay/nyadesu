"use strict";

const fs = require("fs")
    , path = require("path");

class Nyadesu {
    start() {
        console.log("-------------------");
        console.log("Nyadesu, v0.1");
        console.log("-------------------");
        console.log("");

        this.loadCore();
    }

    loadCore() {
        this.corePath = path.join(__dirname, "Core");
        this._loadedCores = [];

        const priorityLoads = ["Logging", "Plugins", "Config"]
            , corePlugins = fs.readdirSync(this.corePath).map(c => c.replace(".js", ""));
        for (let p of priorityLoads.concat(corePlugins)) {
            if (this._loadedCores.indexOf(p) >= 0)
                continue;

            let coreP = require(path.join(this.corePath, p));
            this[p] = new coreP();
            this._loadedCores.push(p);
        }

        this.Logging.log("Nyadesu", `Loaded ${this._loadedCores.length} core(s). [${this._loadedCores.join(", ")}]`);
    }
}

module.exports = Nyadesu;
let NyadesuI = global.Nyadesu = new Nyadesu();
NyadesuI.start();