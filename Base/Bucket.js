"use strict";

class Bucket {
    constructor(name, requests, limit, options) {
        this.name = name;
        this.requests = requests;
        this.limit = limit;

		// the limit = requests per limit(time)

        this.mode = "global";

        if (options.perServer)
            this.mode = "perServer";
        else if (options.perUser)
            this.mode = "perUser";  
    }
}

module.exports = Bucket;