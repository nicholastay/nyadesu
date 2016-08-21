"use strict";

const Plugin = require("../../Base/Plugin")
    , PluginCommand = require("../../Base/PluginCommand")
    , Permission = require("../../Util/Permission")
    , UserError = require("../../Base/UserError");

class Admin extends Plugin {
    constructor() {
        super();

        this.addCommand(new PluginCommand("prune", {
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true,
            requireInput: 1,
            reply: true,
            allowPM: false
        }, this.pruneCommand));

        this.addCommand(new PluginCommand("clean", {
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true,
            requireInput: 1,
            reply: true
        }, this.cleanCommand));

        this.addCommand(new PluginCommand("ignorechan", {
            permission: Permission.SERVER_MOD,
            onReturnSuccess: true,
            reply: true,
            allowPM: false,
            allowIgnoredChannels: true
        }, this.ignoreChanCommand));
    }

    pruneCommand(tail, author, channel) {
        let numToDelete = Number(tail[0])
          , silent = tail[1] === "silent";
        if (!numToDelete || numToDelete < 1)
            throw new UserError("Invalid number of messages to prune...");

        return Nyadesu.Client.getMessages(channel.id, numToDelete+1) // +1 including the command itself
            .then(msgs => msgs.map(m => m.id))
            .then(msgIds => Nyadesu.Client.deleteMessages(channel.id, msgIds))
            .then(() => {
                if (!silent)
                    return `Successfully pruned the last ${numToDelete} messages in this channel.`;
                return null;
            });
    }

    cleanCommand(tail, author, channel) {
        let numToDelete = Number(tail[0])
          , silent = tail[1] === "silent";
        if (!numToDelete || numToDelete < 1)
            throw new UserError("Invalid number of messages to clean...");

        return Nyadesu.Client.getMessages(channel.id)
            .then(msgs => msgs.filter(m => m.id && (m.author.id === Nyadesu.Client.user.id)).map(m => m.id))
            .then(filteredMsgs => {
                if (filteredMsgs.length < 1)
                    throw new UserError("There were no messages of mine in the last 50 messages to delete...");
                return filteredMsgs.slice(numToDelete * -1); // last x elements
            })
            .then(msgIds => Nyadesu.Client.deleteMessages(channel.id, msgIds).then(() => msgIds.length))
            .then(msgCount => {
                if (!silent)
                    return `Successfully deleted ${msgCount} of my messages from the last 50 messages in this channel.`;
                return null;
            });
    }

    ignoreChanCommand(tail, author, channel, message) {
        let ignoredChans = Nyadesu.SettingsManager.getSetting(channel.guild.id, "ignored_channels");
        if (ignoredChans.indexOf(channel.id) >= 0 && tail[0])
            return; // we are supposed to be ignoring this channel!

        let chan = channel.id;
        if (tail[0]) {
            if (!message.channelMentions[0])
                throw new UserError("Invalid channel to toggle ignore, mention the channel or leave blank to default to this channel.");
            chan = message.channelMentions[0];
        }

        let alreadyIgnoredPos = ignoredChans.indexOf(chan);

        let prom;
        if (alreadyIgnoredPos >= 0) { // already ignored, unignore
            ignoredChans.splice(alreadyIgnoredPos, 1);
            prom = Nyadesu.SettingsManager.editSetting(channel.guild.id, "ignored_channels", ignoredChans);
        } else {
            ignoredChans.push(chan);
            prom = Nyadesu.SettingsManager.editSetting(channel.guild.id, "ignored_channels", ignoredChans);
        }

        return prom.then(() => `Successfully ${alreadyIgnoredPos >= 0 ? "un" : ""}ignored channel: ${channel.guild.channels.find(c => c.id === chan).mention}.`);
    }
}

module.exports = Admin;