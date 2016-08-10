"use strict";

const events = require("events");

class Events extends events.EventEmitter {}

module.exports = Events;