"use strict";

const eris = require("eris")
    , fetch = require("node-fetch")
    , htmlToText = require("html-to-text")
    , humanizeDuration = require("humanize-duration");

const Plugin = require("../../Base/Plugin")
    , BucketInfo = require("../../Base/BucketInfo")
    , PluginCommand = require("../../Base/PluginCommand")
    , Permission = require("../../Util/Permission")
    , UserError = require("../../Base/UserError");

const DOWNFOREVERYONE_REGEX = /just you\. (.*?) is up\./;

class Core extends Plugin {
    constructor() {
        super();

        this.commandKeys = {};

        // this.addRawHandler("about nyadesu", m => {
        //     if (m.content === "!nyadesu")
        //         m.createMessage("desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016");
        // });
        
        this.addCommand(new PluginCommand("nyadesu", this.nyadesuCommand));

        this.addCommand(new PluginCommand("testwebsite", {
            reply: true,
            requireInput: 1,
            rateLimitedInfo: new BucketInfo("Core.testWebsite", 3, "minute", { perUser: true })
        }, this.testWebsiteCommand));

        // this.addCommand(new PluginCommand("fail", "deliberate promise reject", () => Promise.reject("o_o")));

        this.addCommand(new PluginCommand("uptime", {
            softReply: true
        }, this.uptimeCommand));
         
        this.addEventHandler("commandhandler", "client.message.split", this.commandHandler.bind(this));

        this.addCommand(new PluginCommand("addcom", {
            reply: true,
            requireInput: 2,
            allowPM: false,
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true
        }, this.addCommandCommand.bind(this)));

        this.addCommand(new PluginCommand("delcom", {
            reply: true,
            requireInput: 1,
            allowPM: false,
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true
        }, this.delCommandCommand.bind(this)));

        this.recacheCommandKeys(null);
    }

    nyadesuCommand() {
        return "desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016";
    }

    uptimeCommand() {
        return `nyadesu has been connected and healthy for: \`${humanizeDuration(Nyadesu.Client.uptime)}\`.
The bot has actually been running for: \`${humanizeDuration(Nyadesu.scriptUptime)}\`. (internet connection issues and the like can cause me to drop :<)`;
    }

    testWebsiteCommand(tail) {
        let website = tail.join(" ");
        return fetch(`http://downforeveryoneorjustme.com/${website}`)
            .then(r => r.text())
            .then(d => {
                if (d.indexOf("doesn't look like a site") >= 0)
                    throw new UserError("Invalid website, please go away :<");

                let msg = htmlToText.fromString(d, { ignoreHref: true })
                  , reg = DOWNFOREVERYONE_REGEX.exec(msg);
                if (!reg)
                    return `❌ It doesn't seem to be just you, \`${website}\` seems to be offline.`;

                return `✅ \`${reg[1]}\` seems to be up, online and functional.`;
            });
    }

    recacheCommandKeys(guildId) {
        if (guildId !== null && typeof guildId !== "string")
            throw new TypeError();

        if (guildId === null) {
            // cache all initial
            return Nyadesu.Database
                .select("trigger", "server_id")
                .from("Commands")
                .then(commands => {
                    commands.forEach(c => {
                        if (!this.commandKeys[c.server_id])
                            this.commandKeys[c.server_id] = [];
                        this.commandKeys[c.server_id].push(c.trigger);
                    });
                });
        }

        return Nyadesu.Database
            .where("server_id", guildId)
            .select("trigger")
            .from("Commands")
            .then(commands => {
                this.commandKeys[guildId] = commands.map(c => c.trigger);
            });
    }

    commandHandler(trigger, tail, message) {
        if (message.author.id === Nyadesu.Client.user.id || message.channel instanceof eris.PrivateChannel || !this.commandKeys[message.channel.guild.id] || this.commandKeys[message.channel.guild.id].indexOf(trigger) < 0)
            return;

        Nyadesu.Database
            .where({
                server_id: message.channel.guild.id,
                trigger: trigger
            })
            .select("output")
            .from("Commands")
            .then(r => message.createMessage(r[0].output));
    }

    addCommandCommand(tail, author, channel) {
        let command = tail.shift()
          , output = tail.join(" ");

        if (this.commandKeys[channel.guild.id] && this.commandKeys[channel.guild.id].indexOf(command) >= 0)
            throw new UserError("This command already exists.");

        return Nyadesu.Database
            .insert({
                trigger: command,
                output: output,
                server_id: channel.guild.id
            })
            .into("Commands")
            .then(() => this.recacheCommandKeys(channel.guild.id))
            .then(() => `Successfully created command: \`${command}\``);
    }

    delCommandCommand(tail, author, channel) {
        let command = tail[0];

        if (!this.commandKeys[channel.guild.id] || this.commandKeys[channel.guild.id].indexOf(command) < 0)
            throw new UserError("This command does not currently exist.");

        return Nyadesu.Database
            .where({
                trigger: command,
                server_id: channel.guild.id
            })
            .del()
            .from("Commands")
            .then(() => this.recacheCommandKeys(channel.guild.id))
            .then(() => `Successfully deleted command: \`${command}\``);
    }
}

module.exports = Core;