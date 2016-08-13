"use strict";

const fs = require("fs")
    , path = require("path")
    , ini = require("ini");

class Plugins {
    constructor() {
        this._pluginDir = path.join(__dirname, "../", "Plugins");
        this._plugins = []; // indexed plugins keyname store

        this._indexPlugins();
    }

    _indexPlugins() {
        // index the plugins and their metadata first
        for (let plugin of fs.readdirSync(this._pluginDir)) {
            if (plugin.startsWith("."))
                continue; // invalid

            let pluginDir = path.join(this._pluginDir, plugin)
              , metadata = {};

            try {
                let metadataPath = path.join(pluginDir, "plugin.ini");
                fs.accessSync(path.join(metadataPath), fs.F_OK);
                metadata = ini.parse(fs.readFileSync(metadataPath, "utf8")).Plugin;
            }
            catch (e) {
                // file doesnt exist, warn
                Nyadesu.Logging.warn("Plugins", `Plugin '${plugin}' does not have/has an invalid a metadata file!`);
            }

            metadata.loaded = false;

            this[plugin] = metadata;
            this._plugins.push(plugin);
        }

        Nyadesu.Logging.success("Plugins", `Indexed ${this._plugins.length} plugin(s). [${this._plugins.join(', ')}]`);
    }

    _loadIndexed() {
        for (let p of this._plugins) {
            let h = require(path.join(this._pluginDir, p));
            this[p].handler = new h();
        }

        this._attachEvents();
        Nyadesu.Logging.success("Plugins", `Loaded the indexed plugin(s) and attached handler.`);
    }

    _attachEvents() {
        Nyadesu.Events.on("client.message", m => {
            for (let p of this._plugins)
                this[p].handler.handle(m);
        });
    }
}

module.exports = Plugins;