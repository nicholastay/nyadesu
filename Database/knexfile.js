"use strict";

const fs = require("fs")
    , path = require("path")
    , ini = require("ini");

let configFile = path.join(__dirname, "../", "config.ini");

fs.accessSync(configFile, fs.F_OK);
let config = ini.parse(fs.readFileSync(configFile, "utf8")).Nyadesu.Database;

let knexfile = {
    development: config
};

module.exports = knexfile;