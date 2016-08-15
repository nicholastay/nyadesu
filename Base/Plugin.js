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

        if (Object.keys(this.commands).length > 0)
            this.checkCommand(message);
    }

    checkCommand(message) {
        let tail = message.content.split(" ")
          , cmd = tail.shift();

        if (!cmd.startsWith(Nyadesu.Config.Client.prefix))
            return;

        let command = this.commands[cmd.replace(Nyadesu.Config.Client.prefix, "")];
        if (!command)
            return;

        if (message.channel instanceof eris.PrivateChannel) {
            if (!command.allowPM)
                return;
        } else if (!command.allowServerChat) {
            return;
        }

        // permission check
        if (!Nyadesu.Permissions.hasPermission(message.member || message.author, (message.member && message.member.guild), command.permission))
            return message.createMessage(`❌ \`${message.author.softMention}: You do not have permission to run this command.\``)

        let _run = () => {
            let c;
            try {
                c = command.handler(tail, message.member || message.author, message.channel, message);
            }
            catch (e) {
                this._throwErr(command.trigger, message.channel, e);
            }

            if (c instanceof Promise) {
                c.then(m => {
                    if (!m)
                        return;

                    if (command.softReply)
                        m = `\`${message.author.softMention}\`: ${m}`;
                    
                    if (command.reply)
                        message.reply(m);
                    else
                        message.createMessage(m);

                    if (command.autoCleanup)
                        setTimeout(() => m.delete(), command.autoCleanup);
                }).catch(e => this._throwErr(command.trigger, message.channel, e));
            } else if (typeof c === "string") {
                message.createMessage(c);
            } else if (c !== null) {
                this._throwErr(command.trigger, message.channel, "Invalid return type, must be Promise/string/null.");
            }
        };
        
        message.channel.sendTyping().then(_run.bind(this));
    }

    _throwErr(mod, channel, e) {
        Nyadesu.Logging.warn(`Plugin-${this.constructor.name}`, `<${mod}> ${e.stack || e}`);
        channel.createMessage(`❌ \`<${this.constructor.name}.${mod}> - ${e}\``);
    }
}

module.exports = Plugin;