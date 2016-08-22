"use strict";

const eris = require("eris");

const PluginCommand = require("./PluginCommand")
    , UserError = require("./UserError");

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
        if (!(command instanceof PluginCommand))
            throw new TypeError();
        
        this.commands[command.trigger] = command;
    }

    addEventHandler(name, event, handler) {
        this.events[name] = { event: event, handler: handler };
        Nyadesu.Events.on(event, handler);
    }

    handleRaw(message) {
        if (Object.keys(this.rawHandlers).length > 0) {
            for (let rH in this.rawHandlers)
                this.rawHandlers[rH](message);
        }
    }

    handleSplit(cmd, tail, message) {
        if (Object.keys(this.commands).length > 0)
            this.checkCommand(cmd, tail, message);
    }

    checkCommand(cmd, tail, message) {
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

        // ignored channel check
        if (!command.allowIgnoredChannels && !(message.channel instanceof eris.PrivateChannel)) {
            let serverIgnored = Nyadesu.SettingsManager.getSetting(message.channel.guild.id, "ignored_channels");
            if (serverIgnored && serverIgnored.indexOf(message.channel.id) >= 0)
                return;
        }

        if (command.requireInput)
            if (tail.length < command.requireInput)
                return message.createMessage(`❌ \`${message.author.softMention}: This command requires at least ${command.requireInput} input(s) to work...\``);

        // permission check
        if (!Nyadesu.Permissions.hasPermission(message.member || message.author, (message.member && message.member.guild), command.permission))
            return message.createMessage(`❌ \`${message.author.softMention}: You do not have permission to run this command.\``);

        // rate limited
        if (command.rateLimitedInfo) {
            let result;
            if (command.rateLimitedInfo.mode === "global")
                result = Nyadesu.Ratelimiting.tryRemoveToken(command.rateLimitedInfo);
            else if (command.rateLimitedInfo.mode === "perUser")
                result = Nyadesu.Ratelimiting.tryRemoveToken(command.rateLimitedInfo, message.author);
            else if (command.rateLimitedInfo.mode === "perServer" && message.channel.guild)
                result = Nyadesu.Ratelimiting.tryRemoveToken(command.rateLimitedInfo, message.channel.guild);

            if (!result) {
                if (command.rateLimitedInfo.mode === "perUser")
                    message.createMessage(`❌ \`${message.author.softMention}: You need to *slooooooow* down bruv...\``);
                return;
            }
        }

        let _run = () => {
            let c;
            try {
                c = command.handler(tail, message.member || message.author, message.channel, message);
            }
            catch (e) {
                return this._throwErr(command.trigger, message, e);
            }

            if (c instanceof Promise) {
                c.then(m => {
                    if (!m)
                        return;
                    this._sendCmdMsg(command, message, m);
                }).catch(e => this._throwErr(command.trigger, message, e));
            } else if (typeof c === "string") {
                this._sendCmdMsg(command, message, c);
            } else if (c !== null) {
                this._throwErr(command.trigger, message, "Invalid return type, must be Promise/string/null.");
            }
        };
        
        message.channel.sendTyping().then(_run.bind(this));
    }

    _sendCmdMsg(command, message, content) {
        if (command.onReturnSuccess)
            content = `✅ ${content}`;

        let prom;
        if (command.reply)
            prom = message.reply(content);
        else if (command.softReply)
            prom = message.softReply(content);
        else
            prom = message.createMessage(content);

        if (command.autoCleanup)
            prom.then(m => setTimeout(() => m.delete(), command.autoCleanup));
    }

    _throwErr(mod, message, e) {
        let uError = e instanceof UserError;
        if (!uError)
            Nyadesu.Logging.warn(`Plugin-${this.constructor.name}`, `<${mod}> ${e.stack || e}`);

        return message.createMessage(`❌ \`${message.author.softMention}\`: \`<${this.constructor.name}.${mod}> - ${e}\``)
            .then(m => {
                if (uError)
                    setTimeout(() => m.delete(), 10500);
            });
    }
}

module.exports = Plugin;