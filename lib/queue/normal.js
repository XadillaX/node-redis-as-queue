/**
 * XadillaX created at 2014-10-31 15:01:50
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var async = require("async");
var util = require("util");
var BaseQueue = require("./base");

var NormalQueue = function() {
    var args = [].slice.apply(arguments);
    BaseQueue.apply(this, args);
};

util.inherits(NormalQueue, BaseQueue);

NormalQueue.prototype._buildQueueName = function(name) {
    return "_raq_☀:" + name;
};

NormalQueue.prototype.push = function(value, callback) {
};

module.exports = NormalQueue;

