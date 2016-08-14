"use strict";

const eris = require("eris");

const Permission = require("../Util/Permission");

class Permissions {
    static get configDefaults() {
        return {
            admins: ["62125999352975360"],
            mods: ["122274983794835457"],
            friends: ["122213573702189056"]
        }
    }

    getUserPermission(user, server) {
        let config = Nyadesu.Config.Permissions;

        if (config.admins.indexOf(user.id) >= 0)
            return Permission.BOT_ADMIN;
        if (config.mods.indexOf(user.id) >= 0)
            return Permission.BOT_MOD;
        if (config.friends.indexOf(user.id) >= 0)
            return Permission.BOT_FRIEND;

        if (!server || !user instanceof eris.Member)
            return Permission.NONE; // give up here if no server or isnt member


        if (user.id === server.ownerID)
            return Permission.SERVER_OWNER;

        let serverAdminRole = server.roles.find(r => r.name === "nyadesu Admin");
        if (r && user.roles.indexOf(serverAdminRole.id) > 0)
            return Permission.SERVER_ADMIN;

        let serverModRole = server.roles.find(r => r.name === "nyadesu Mod");
        if (r && user.roles.indexOf(serverAdminRole.id) > 0)
            return Permission.SERVER_MOD;

        let serverRegularRole = server.roles.find(r => r.name === "nyadesu Regular");
        if (r && user.roles.indexOf(serverAdminRole.id) > 0)
            return Permission.SERVER_REGULAR;


        return Permission.NONE;
    }

    hasPermission(user, server, permission) {
        if (permission === Permission.NONE)
            return true;

        if (this.getUserPermission(user, server) >= permission)
            return true;
        return false;
    }
}

module.exports = Permissions;