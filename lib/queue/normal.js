/**
 * XadillaX created at 2014-10-31 15:01:50
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var async = require("async");
var util = require("util");
var BaseQueue = require("./base");
var MAX_UINT = 4294967295;

var NormalQueue = function() {
    var args = [].slice.apply(arguments);
    BaseQueue.apply(this, args);
};

util.inherits(NormalQueue, BaseQueue);

NormalQueue.prototype._buildQueueName = function(name) {
    return "_raq_☀:" + name;
};

NormalQueue.prototype.push = function(value, callback) {
    if(!this.redis) {
        return callback(new Error("This queue object has been destroyed."));
    }

    this.redis.rpush([ this.queueName, value ], callback);
};

NormalQueue.prototype.get = function(amount, callback) {
    if(typeof amount === "function") {
        callback = amount;
        amount = 1;
    }
    if(amount === -1) {
        amount = MAX_UINT;
    }

    this.redis.lrange([ this.queueName, 0, amount - 1 ], function(err, messages) {
        return callback(err, messages);
    });
};

NormalQueue.prototype.removeAmount = function(amount, callback) {
    if(!this.redis) return callback(new Error("This queue object has been destroyed."));

    if(typeof amount === "function") {
        callback = amount;
        amount = 1;
    }
    if(amount === -1) {
        amount = MAX_UINT;
    }

    this.redis.ltrim([ this.queueName, amount, "-1" ], callback);
};

NormalQueue.prototype.length = function(callback) {
    if(!this.redis) return callback(new Error("This queue object has been destroyed."));
    this.redis.llen([ this.queueName ], callback);
};

module.exports = NormalQueue;

