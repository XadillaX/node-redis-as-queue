/**
 * XadillaX created at 2014-10-29 18:10:44
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var Scarlet = require("scarlet-task");
var async = require("async");
var util = require("util");
var BaseQueue = require("./base");

var UniqueQueue = function() {
    var args = [].slice.apply(arguments);
    BaseQueue.apply(this, args);
};

util.inherits(UniqueQueue, BaseQueue);

UniqueQueue.prototype._buildQueueName = function(name) {
    return "_raq_✿:" + name;
};

UniqueQueue.prototype.push = function(value, needUpdate, callback) {
    if(typeof needUpdate === "function") {
        callback = needUpdate;
        needUpdate = false;
    }

    if(!this.redis) return callback(new Error("This queue object has been destroyed."));

    var self = this;
    var exists = false;
    async.waterfall([
        function(callback) {
            if(needUpdate) return callback();

            // is this member exists...
            self.redis.zrank([ self.queueName, value ], function(err, rank) {
                if(err) return callback(err);
                if(null !== rank) {
                    exists = true;
                }
                callback();
            });
        },

        function(callback) {
            if(exists) return callback();

            // should update / insert this record to message queue
            self.redis.zadd([ self.queueName, +(new Date()), value ], callback);
        }
    ], callback);
};

UniqueQueue.prototype.removeMessages = function(messages, callback) {
    if(!this.redis) return callback(new Error("This queue object has been destroyed."));

    if(!messages || !messages.length) {
        return callback(undefined, 0, []);
    }

    var still = [];
    var removeCount = 0;
    var scarlet = new Scarlet(5);
    var error;

    var self = this;

    /**
     * the REMOVE processor
     *
     * give the message value, and then this processor
     * will use `ZREM` to remove this message from redis.
     */
    var _remove = function(TO) {
        self.redis.zrem([ self.queueName, TO.task.message ], function(err, amount) {
            if(err) {
                error = err;
                still.push(TO.task.message);
            } else if(!amount) {
                still.push(TO.task.message);
            } else removeCount += amount;

            scarlet.taskDone(TO);
        });
    };

    /**
     * assign REMOVE processor to each message
     * with scarlet task queue.
     */
    for(var i = 0; i < messages.length; i++) {
        scarlet.push(messages[i], _remove);
    }

    /**
     * after finishing removing, callback function
     * will be called.
     */
    scarlet.afterFinish(messages.length, function() {
        if(!still || !still.length) {
            return callback(undefined, removeCount, still);
        }

        callback(error, removeCount, still);
    }, false);
};

UniqueQueue.prototype.removeAmount = function(amount, callback) {
    if(!this.redis) return callback(new Error("This queue object has been destroyed."));

    if(typeof amount === "function") {
        callback = amount;
        amount = 1;
    }

    /**
     * if need remove all the messages
     * I will use `ZREMRANGEBYSCORE` to
     * remove from -inf to +inf;
     */
    if(-1 === amount) {
        var commands = [ this.queueName, "-inf", "+inf" ];
        return this.redis.zremrangebyscore(commands, callback);
    }

    /**
     * otherwise, I will use `ZREMRANGEBYRANK`
     * to remove from the first one to (amount)th
     * one.
     */
    var commands = [ this.queueName, "0", amount - 1 ];
    this.redis.zremrangebyrank(commands, callback);
};

UniqueQueue.prototype.get = function(amount, callback) {
   if(!this.redis) return callback(new Error("This queue object has been destroyed."));

   if(typeof amount === "function") {
        callback = amount;
        amount = 1;
    }

    var commands = [ this.queueName, "-inf", "+inf", "WITHSCORES" ];
    if(amount !== -1) {
        commands.push("LIMIT");
        commands.push("0");
        commands.push(amount);
    }

    this.redis.zrangebyscore(commands, function(err, messages) {
        if(err) return callback(err);

        var m = [];
        if(!messages || !messages.length) return callback(undefined, m);

        for(var i = 0; i < messages.length; i += 2) {
            m.push({ message: messages[i], updatedAt: parseInt(messages[i + 1]) });
        }

        callback(undefined, m);
    });
};

UniqueQueue.prototype.length = function(callback) {
    if(!this.redis) return callback(new Error("This queue object has been destroyed."));

    this.redis.zcount([ this.queueName, "-inf", "+inf" ], callback);
};

module.exports = UniqueQueue;

