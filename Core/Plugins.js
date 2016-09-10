"use strict";

const fs = require("fs")
    , path = require("path")
    , ini = require("ini");

const Hotreload = require("../Util/Hotreload");

class Plugins {
    constructor() {
        this._pluginDir = path.join(__dirname, "../", "Plugins");
        this._plugins = []; // indexed plugins keyname store

        this._indexPlugins();
    }

    _indexPlugin(pluginName) {
        let pluginDir = path.join(this._pluginDir, pluginName)
          , metadata = {};

        try {
            let metadataPath = path.join(pluginDir, "plugin.ini");
            fs.accessSync(path.join(metadataPath), fs.F_OK);
            metadata = ini.parse(fs.readFileSync(metadataPath, "utf8")).Plugin;
        }
        catch (e) {
            // file doesnt exist, warn
            Nyadesu.Logging.warn("Plugins", `Plugin '${pluginName}' does not have/has an invalid a metadata file!`);
        }

        metadata.loaded = false;

        this[pluginName] = metadata;
        this._plugins.push(pluginName);
    }

    _indexPlugins() {
        // index the plugins and their metadata first
        for (let plugin of fs.readdirSync(this._pluginDir)) {
            if (plugin.startsWith("."))
                continue; // invalid

            this._indexPlugin(plugin);
        }

        Nyadesu.Logging.success("Plugins", `Indexed ${this._plugins.length} plugin(s). [${this._plugins.join(', ')}]`);
    }

    _load(pluginName, skipMetadata) {
        if (Nyadesu.Config.Plugin[pluginName] && Nyadesu.Config.Plugin[pluginName].enabled === "0") {
            this._unload(pluginName, true);
            Nyadesu.Logging.warn("Plugins", `Plugin '${pluginName}' disabled in config, de-indexing and not loading.`);
            return false;
        }

        if (!skipMetadata) 
            this._indexPlugin(pluginName);

        if (this[pluginName].loaded)
            return false;

        let h = require(path.join(this._pluginDir, pluginName));
        this[pluginName].handler = new h();
        this[pluginName].loaded = true;
        return true;
    }

    _unload(pluginName, skipHotDestroy) {
        if (!this[pluginName])
            return false;
        delete(this[pluginName]);
        this._plugins.splice(this._plugins.indexOf(pluginName), 1);

        if (skipHotDestroy)
            return true;
        return Hotreload.unload(path.join(this._pluginDir, pluginName));
    }

    _reload(pluginName) {
        if (!this[pluginName])
            return false;
        this._unload(pluginName);
        this._load(pluginName);
        Nyadesu.Logging.log("Plugins", `Reloaded plugin '${pluginName}'.`);
    }

    _loadIndexed() {
        this._plugins.slice(0).forEach(p => this._load(p, true)); // have to clone the object so it doesnt skip -.-
        this._attachEvents();
        Nyadesu.Logging.success("Plugins", `Loaded the indexed plugin(s) and attached handler.`);
    }

    _attachEvents() {
        Nyadesu.Events.on("client.message", m => {
            // global message splitter
            let tail = m.content.split(" ")
              , firstWord = tail.shift();
            Nyadesu.Events.emit("client.message.split", firstWord, tail, m);

            // handle plugins
            for (let p of this._plugins) {
                if (!this[p].loaded) {
                    Nyadesu.Logging.warn("Plugins", `Plugin '${p}' not loaded but indexed!`);
                    continue;
                }

                this[p].handler.handleRaw(m);
                this[p].handler.handleSplit(firstWord, tail, m);
            }
        });
    }
}

module.exports = Plugins;