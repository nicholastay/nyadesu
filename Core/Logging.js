"use strict";

const strftime = require("fast-strftime")
    , chalk = require("chalk");

class Logging {
    log(moduleName, content) {
        console.log(chalk.magenta(`[${strftime("%I:%M%P")}]`), "/", `${chalk.cyan(moduleName)}: ${content}`);
    }

    success(moduleName, content) {
        this.log(moduleName, chalk.green("✓ <SUCCESS> " + content));
    }

    warn(moduleName, content) {
        this.log(moduleName, chalk.yellow("<! WARN> " + content));
    }

    fatal(moduleName, content) {
        this.log(moduleName, chalk.red("<✗ FATAL> " + content));
        process.exit(1);
    }
}

module.exports = Logging;