/**
 * XadillaX created at 2014-10-29 17:30:30
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var redis = require("redis");

/**
 * create client
 * @return {Client} a redis client
 */
exports.createClient = function() {
    var client = redis.createClient.apply(redis, arguments);
    client.on("error", function(err) {
        console.error("An error occurred on redis client: " + err.message);
    });
    return client;
};

/**
 * release client
 *
 * @param {Redis} client redis client
 */
exports.releaseClient = function(client) {
    client.quit();
};

