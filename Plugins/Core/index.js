"use strict";

const Eris = require("eris");

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , Permission = require("../../Util/Permission")
    , UserError = require("../../Base/UserError");

class Core extends Plugin {
    constructor() {
        super();

        this.commandKeys = {};

        // this.addRawHandler("about nyadesu", m => {
        //     if (m.content === "!nyadesu")
        //         m.createMessage("desunya! chatbot by Nexerq (nexerq@gmail.com) ~ 2016");
        // });
        
        this.addCommand(new PluginCommand("nyadesu", {
            embed: true
        }, this.nyadesuCommand));

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
        return {
            title: `nyadesu v${Nyadesu.version}`,
            type: "rich",
            description: "up and healthy, ready to serve o7",
            fields: [
                {
                    name: "owner",
                    value: "Nexerq#5504 <nexerq@gmail.com>"
                },
                {
                    name: "guild count",
                    value: Nyadesu.Client.guilds.size,
                    inline: true
                },
                {
                    name: "users aware",
                    value: Nyadesu.Client.users.size,
                    inline: true
                }
            ]
        };
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
        if (message.author.id === Nyadesu.Client.user.id || message.channel instanceof Eris.PrivateChannel || !this.commandKeys[message.channel.guild.id] || this.commandKeys[message.channel.guild.id].indexOf(trigger) < 0)
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