/**
 * XadillaX created at 2014-11-03 15:01:32
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var Scarlet = require("scarlet-task");
var should = require("should");
var Redis = require("redis");
var NormalQueue = require("../").NormalQueue;
var MAX_UINT = 4294967295;

describe("[normal queue]", function() {
    var queueName = "mocha";
    var normalQueue;
    var redis;
    before(function(done) {
        redis = Redis.createClient();
        normalQueue = new NormalQueue(queueName);
        normalQueue.deleteQueue(function() {
            done();
        });
    });

    describe("#_buildQueueName()", function() {
        it("should equal to _raq_☀:mocha", function(done) {
            normalQueue.queueName.should.eql("_raq_☀:" + queueName);
            done();
        });
    });

    describe("#queueName", function() {
        it("should equal to _raq_☀:mocha", function(done) {
            normalQueue.queueName.should.eql("_raq_☀:" + queueName);
            done();
        });
    });

    describe("#push()", function() {
        var scarlet = new Scarlet(1);
        it("should push 10 items in order - [ '0', '1', ..., '9' ]", function(done) {
            for(var i = 0; i < 10; i++) {
                scarlet.push(i, function(TO) {
                    normalQueue.push(TO.task, function() {
                        scarlet.taskDone(TO);
                    });
                });
            }

            scarlet.push(undefined, function(TO) {
                redis.lrange([ normalQueue.queueName, 0, MAX_UINT ], function(err, messages) {
                    var std = [];
                    for(var i = 0; i < 10; i++) std.push(i.toString());
                    messages.should.eql(std);
                    scarlet.taskDone(TO);
                    done();
                });
            });
        });
    });

    describe("#length()", function() {
        it("should be 10", function(done) {
            normalQueue.length(function(err, l) {
                l.should.eql(10);
                done();
            });
        });
    });

    describe("#get()", function() {
        it("get first one element - [ '0' ]", function(done) {
            normalQueue.get(function(err, messages) {
                messages.should.eql([ '0' ]);
                done();
            });
        });

        it("get elements count less than elements count in queue - [ '0', '1', '2' ]", function(done) {
            normalQueue.get(3, function(err, messages) {
                messages.should.be.an.Array;
                messages.should.have.length(3);
                messages.should.eql([ '0', '1', '2' ]);

                done();
            });
        });

        it("get elements count equals to elements count in queue - [ '0', '1', ..., '9' ]", function(done) {
            normalQueue.get(10, function(err, messages) {
                var std = [];
                for(var i = 0; i < 10; i++) std.push(i.toString());
                messages.should.eql(std);
                done();
            });
        });

        it("get elements count greater than elements count in queue - [ '0', '1', ..., '9' ]", function(done) {
            normalQueue.get(100, function(err, messages) {
                var std = [];
                for(var i = 0; i < 10; i++) std.push(i.toString());
                messages.should.eql(std);
                done();
            });
        });

        it("amount equals to -1 (get all the messages) - [ '0', '1', ..., '9' ]", function(done) {
            normalQueue.get(-1, function(err, messages) {
                var std = [];
                for(var i = 0; i < 10; i++) std.push(i.toString());
                messages.should.eql(std);
                done();
            });
        });
    });

    describe("#removeAmount()", function() {
        beforeEach(function(done) {
            normalQueue.deleteQueue(function() {
                var scarlet = new Scarlet(1);
                for(var i = 0; i < 10; i++) {
                    scarlet.push(i, function(TO) {
                        normalQueue.push(TO.task, function() {
                            scarlet.taskDone(TO);
                        });
                    });
                }

                scarlet.push(undefined, function(TO) {
                    scarlet.taskDone(TO);
                    done();
                });
            });
        });

        it("delete first element", function(done) {
            normalQueue.removeAmount(function(err) {
                normalQueue.get(-1, function(err, messages) {
                    var std = [];
                    for(var i = 1; i < 10; i++) std.push(i.toString());
                    messages.should.eql(std);
                    done();
                });
            });
        });

        it("delete elements count less than elements count in queue", function(done) {
            normalQueue.removeAmount(5, function(err) {
                normalQueue.get(-1, function(err, messages) {
                    var std = [];
                    for(var i = 5; i < 10; i++) std.push(i.toString());
                    messages.should.eql(std);
                    done();
                });
            });
        });

        it("delete elements count equals to elements count in queue", function(done) {
            normalQueue.removeAmount(10, function(err) {
                normalQueue.get(-1, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("delete elements count greater than elements count in queue", function(done) {
            normalQueue.removeAmount(10, function(err) {
                normalQueue.get(15, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("delete to the end (-1)", function(done) {
            normalQueue.removeAmount(-1, function(err) {
                normalQueue.get(15, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });
    });

    describe("#@when empty", function() {
        it("get message(s) from an empty queue", function(done) {
            normalQueue.get(10, function(err, messages) {
                messages.should.eql([]);
                done();
            });
        });

        it("get length from an empty queue", function(done) {
            normalQueue.length(function(err, l) {
                l.should.eql(0);
                done();
            });
        });

        it("get message(s) from an unexist queue", function(done) {
            redis.del([ normalQueue.queueName ], function() {
                normalQueue.get(10, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("get length from an unexists queue", function(done) {
            normalQueue.length(function(err, l) {
                l.should.eql(0);
                done();
            });
        });
    });

    describe("#deleteQueue", function() {
        before(function(done) {
            normalQueue.push(10, function() { done(); });
        });
        
        it("delete a normal queue", function(done) {
            normalQueue.deleteQueue(function() {
                redis.exists([ normalQueue.queueName ], function(err, res) {
                    res.should.eql(0);
                    done();
                });
            });
        });
    });

    describe("#destroy", function() {
        it("destroy this instance", function(done) {
            normalQueue.destroy();
            (normalQueue.redis === undefined).should.eql(true);
            done();
        });

        it("get error when do something", function(done) {
            var scarlet = new Scarlet(10);
            scarlet.push(undefined, function(TO) {
                normalQueue.push(1, function(err) {
                    err.should.be.an.instanceof(Error);
                    scarlet.taskDone(TO);
                });
            });

            scarlet.afterFinish(1, function() {
                done();
            });
        });
    });
});

