"use strict";

const fs = require("fs")
    , path = require("path")
    , ini = require("ini");

// Base template
const confTemplate = {
    nice: "nice"
};
let coreDefaults = {};

class Config {
    constructor() {
        this._config = {};
        this._configFile = path.join(__dirname, "../", "config.ini");

        try {
            fs.accessSync(this._configFile, fs.F_OK);
            this._config = ini.parse(fs.readFileSync(this._configFile, "utf8")).Nyadesu;
            if (!this._config)
                this._config = {};
        }
        catch (e) {
            // file doesnt exist, create
            Nyadesu.Logging.log("Config", "Config does not exist, generating.")
            fs.writeFileSync(this._configFile, "", "utf8");
        }

        this._loadCoreDefaults();
        this._checkMissingKeys();

        this._keys = [];
        for (let k in this._config) {
            this[k] = this._config[k];
            this._keys.push(k);
        }

        Nyadesu.Logging.success("Config", "Config loaded.");
    }

    _save() {
        fs.writeFileSync(this._configFile, ini.stringify(this._config, { section: "Nyadesu" }));
    }

    _loadCoreDefaults() {
        for (let c of fs.readdirSync(__dirname)) {
            let cDefault = require(path.join(__dirname, c)).configDefaults;
            if (!cDefault)
                continue;

            coreDefaults[c.replace(".js", "")] = cDefault;
        }
    }

    _checkMissingKeys() {
        let newKeys = false;
        for (let k in confTemplate) {
            if (!this._config[k]) {
                this.config[k] = confTemplate[k];
                newKeys = true;
            }
        }

        for (let cP in coreDefaults) {
            // check base plugin key
            if (!this._config[cP]) {
                this._config[cP] = {};
                newKeys = true;
            }

            for (let cK in coreDefaults[cP]) {
                // check new keys in each plugin key
                if (!this._config[cP][cK]) {
                    this._config[cP][cK] = coreDefaults[cP][cK];
                    newKeys = true;
                }
            }
        }

        if (newKeys) {
            this._save();
            Nyadesu.Logging.log("Config", "New Config keys were generated. Please edit them and relaunch.");
            process.exit(0);
        }
    }
}

module.exports = Config;