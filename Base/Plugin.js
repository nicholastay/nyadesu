"use strict";

const eris = require("eris");

const PluginCommand = require("./PluginCommand");

class Plugin {
    constructor() {
        this.rawHandlers = {};
        this.commands = {};
        this.events = {};
    }

    get config() {
        return (Nyadesu.Config.Plugin[this.constructor.name]) || {};
    }

    addRawHandler(name, handler) {
        this.rawHandlers[name] = handler;
    }

    addCommand(command) {
        if (!command instanceof PluginCommand)
            throw new TypeError();
        
        this.commands[command.trigger] = command;
    }

    addEventHandler(name, event, handler) {
        this.events[name] = { event: event, handler: handler };
        Nyadesu.Events.on(event, handler.bind(this));
    }

    handle(message) {
        if (Object.keys(this.rawHandlers).length > 0) {
            for (let rH in this.rawHandlers)
                this.rawHandlers[rH](message);
        }

        if (Object.keys(this.commands).length > 0) {
            let tail = message.content.split(" ")
              , cmd = tail.shift();

            for (let cH in this.commands) {
                let command = this.commands[cH];
                if (message.channel instanceof eris.PrivateChannel) {
                    if (!command.allowPM)
                        continue;
                } else if (!command.allowServerChat) {
                    continue;
                }

                let run = () => {
                    let c;
                    try {
                        c = command.handler(tail, message.member || message.author, message.channel, message);
                    }
                    catch (e) {
                        this._throwErr(command.trigger, message.channel, e);
                    }

                    if (c instanceof Promise) {
                        c.then(m => Nyadesu.Client.createMessage(message.channel.id, m))
                            .catch(e => this._throwErr(command.trigger, message.channel, e));
                    } else if (typeof c === "string") {
                        Nyadesu.Client.createMessage(message.channel.id, c);
                    } else {
                        this._throwErr(command.trigger, message.channel, "Invalid return type, must be Promise/string.");
                    }
                };

                let trigger = Nyadesu.Config.Client.prefix + command.trigger;
                if (command.caseSensitive && trigger === cmd) {
                    run();
                } else if (trigger === cmd.toLowerCase()) {
                    run();
                }
            }
        }
    }

    _throwErr(mod, channel, e) {
        Nyadesu.Logging.warn(`Plugin-${this.constructor.name}`, `<${mod}> ${e.stack || e}`);
        Nyadesu.Client.createMessage(channel.id, `✗ <${this.constructor.name}.${mod}> \`Error: ${e}\``);
    }
}

module.exports = Plugin;