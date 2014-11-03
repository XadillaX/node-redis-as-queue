/**
 * XadillaX created at 2014-10-29 17:47:54
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var Redis = require("../redis");

var BaseQueue = function() {
    var args = [].slice.call(arguments);
    if(args.length < 1) {
        throw new Error("You should specified the queue name.");
    }

    this.queueName = this._buildQueueName(args[0]);
    args.shift();
    this.redis = Redis.createClient.apply(Redis, args);
};

BaseQueue.prototype._buildQueueName = function(name) {
    return name;
};

BaseQueue.prototype.push = function(callback) {};
BaseQueue.prototype.get = function(amount, callback) {};
BaseQueue.prototype.removeAmount = function(amount, callback) {};
BaseQueue.prototype.removeMessages = function(messages, callback) {};
BaseQueue.prototype.length = function(callback) {};
BaseQueue.prototype.destroy = function() {
    Redis.releaseClient(this.redis);
    this.redis = undefined;
};
BaseQueue.prototype.deleteQueue = function(callback) {
    this.redis.del([ this.queueName ], callback);
};

module.exports = BaseQueue;

