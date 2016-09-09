"use strict";

class Hotreload {
    static unload(modulePath) {
        if (require.cache[require.resolve(modulePath)]) {
            delete(require.cache[require.resolve(modulePath)]);
            return true;
        }
        
        return false;
    }
}

module.exports = Hotreload;