/**
 * XadillaX created at 2014-11-04 10:22:11
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var Scarlet = require("scarlet-task");
var should = require("should");
var Redis = require("redis");
var UniqueQueue = require("../").UniqueQueue;
var MAX_UINT = 4294967295;

describe("[unique queue]", function() {
    var queueName = "mocha";
    var uniqueQueue;
    var redis;
    var stdMessages = [];
    before(function(done) {
        redis = Redis.createClient();
        uniqueQueue = new UniqueQueue(queueName);
        uniqueQueue.deleteQueue(function() {
            done();
        });
    });

    describe("#_buildQueueName()", function() {
        it("should equal to _raq_✿:mocha", function(done) {
            uniqueQueue.queueName.should.eql("_raq_✿:" + queueName);
            done();
        });
    });

    describe("#queueName", function() {
        it("should equal to _raq_✿:mocha", function(done) {
            uniqueQueue.queueName.should.eql("_raq_✿:" + queueName);
            done();
        });
    });

    describe("#push()", function() {
        var scarlet = new Scarlet(1);
        it("should push 10 items in order - [ '0', '1', ..., '9' ]", function(done) {
            for(var i = 0; i < 10; i++) {
                scarlet.push(i, function(TO) {
                    uniqueQueue.push(TO.task, function() {
                        scarlet.taskDone(TO);
                    });
                });
            }

            scarlet.push(undefined, function(TO) {
                redis.zrangebyscore([ uniqueQueue.queueName, "-inf", "+inf", "WITHSCORES" ], function(err, messages) {
                    var now = +new Date();
                    messages.should.be.an.instanceof(Array);
                    for(var i = 0; i < 20; i += 2) {
                        messages[i].should.eql((i / 2).toString());
                        messages[i + 1] = parseInt(messages[i + 1]);
                        messages[i + 1].should.be.above(now - 2000).and.be.below(now);

                        stdMessages.push({ message: messages[i], updatedAt: messages[i + 1] });
                    }

                    scarlet.taskDone(TO);
                    done();
                });
            });
        });
    });

    describe("#length()", function() {
        it("should be 10", function(done) {
            uniqueQueue.length(function(err, l) {
                l.should.eql(10);
                done();
            });
        });
    });

    describe("#get()", function() {
        it("get first one element", function(done) {
            uniqueQueue.get(function(err, messages) {
                messages.should.eql([ stdMessages[0] ]);
                done();
            });
        });

        it("get elements count less than elements count in queue", function(done) {
            uniqueQueue.get(3, function(err, messages) {
                messages.should.be.an.Array;
                messages.should.have.length(3);
                messages.should.eql([ stdMessages[0], stdMessages[1], stdMessages[2] ]);

                done();
            });
        });

        it("get elements count equals to elements count in queue", function(done) {
            uniqueQueue.get(10, function(err, messages) {
                messages.should.eql(stdMessages);
                done();
            });
        });

        it("get elements count greater than elements count in queue", function(done) {
            uniqueQueue.get(100, function(err, messages) {
                messages.should.eql(stdMessages);
                done();
            });
        });

        it("amount equals to -1 (get all the messages)", function(done) {
            uniqueQueue.get(-1, function(err, messages) {
                messages.should.eql(stdMessages);
                done();
            });
        });
    });

    describe("#removeMessages()", function() {
        var _stdMessages0 = [];
        beforeEach(function(done) {
            uniqueQueue.deleteQueue(function() {
                var scarlet = new Scarlet(1);
                for(var i = 0; i < 10; i++) {
                    scarlet.push(i, function(TO) {
                        uniqueQueue.push(TO.task, function() {
                            scarlet.taskDone(TO);
                        });
                    });
                }

                scarlet.push(undefined, function(TO) {
                    uniqueQueue.get(-1, function(err, messages) {
                        _stdMessages0 = messages;
                        scarlet.taskDone(TO);
                        done();
                    });
                });
            });
        });

        it("remove empty messages", function(done) {
            uniqueQueue.removeMessages([], function(err, removeCount, still) {
                removeCount.should.eql(0);
                still.should.eql([]);
                uniqueQueue.get(-1, function(err, messages) {
                    messages.should.eql(_stdMessages0);
                    done();
                });
            });
        });

        it("delete messages", function(done) {
            var out = [];
            var left = [];
            for(var i = 0; i < 10; i += 2) {
                out.push(_stdMessages0[i]);
                left.push(_stdMessages0[i + 1]);
            }
            uniqueQueue.removeMessages(out, function(err, removeCount, still) {
                removeCount.should.eql(5);
                still.should.eql([]);
                uniqueQueue.get(-1, function(err, messages) {
                    messages.should.eql(left);
                    done();
                });
            });
        });

        it("delete messages not in queue", function(done) {
            var out = [ { message: "11", updatedAt: +new Date() + 1000 }, _stdMessages0[9] ];
            _stdMessages0.pop();
            uniqueQueue.removeMessages(out, function(err, removeCount, still) {
                removeCount.should.eql(1);
                still.should.eql([ out[0].message ]);
                uniqueQueue.get(-1, function(err, messages) {
                    messages.should.eql(_stdMessages0);
                    done();
                });
            });
        });
    });

    describe("#removeAmount()", function() {
        var _stdMessages1 = [];
        beforeEach(function(done) {
            uniqueQueue.deleteQueue(function() {
                var scarlet = new Scarlet(1);
                for(var i = 0; i < 10; i++) {
                    scarlet.push(i, function(TO) {
                        uniqueQueue.push(TO.task, function() {
                            scarlet.taskDone(TO);
                        });
                    });
                }

                scarlet.push(undefined, function(TO) {
                    uniqueQueue.get(-1, function(err, messages) {
                        _stdMessages1 = messages;
                        scarlet.taskDone(TO);
                        done();
                    });
                });
            });
        });

        it("delete first element", function(done) {
            uniqueQueue.removeAmount(function(err) {
                uniqueQueue.get(-1, function(err, messages) {
                    _stdMessages1.shift();
                    messages.should.eql(_stdMessages1);
                    done();
                });
            });
        });

        it("delete elements count less than elements count in queue", function(done) {
            uniqueQueue.removeAmount(5, function(err) {
                uniqueQueue.get(-1, function(err, messages) {
                    for(var i = 0; i < 5; i++) _stdMessages1.shift();
                    messages.should.eql(_stdMessages1);
                    done();
                });
            });
        });

        it("delete elements count equals to elements count in queue", function(done) {
            uniqueQueue.removeAmount(10, function(err) {
                uniqueQueue.get(-1, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("delete elements count greater than elements count in queue", function(done) {
            uniqueQueue.removeAmount(10, function(err) {
                uniqueQueue.get(15, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("delete to the end (-1)", function(done) {
            uniqueQueue.removeAmount(-1, function(err) {
                uniqueQueue.get(15, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });
    });

    describe("#push() -> update", function() {
        var _stdMessages2 = [];
        beforeEach(function(done) {
            uniqueQueue.deleteQueue(function() {
                var scarlet = new Scarlet(1);
                for(var i = 0; i < 10; i++) {
                    scarlet.push(i, function(TO) {
                        uniqueQueue.push(TO.task, function() {
                            scarlet.taskDone(TO);
                        });
                    });
                }

                scarlet.push(undefined, function(TO) {
                    uniqueQueue.get(-1, function(err, messages) {
                        _stdMessages2 = messages;
                        scarlet.taskDone(TO);
                        done();
                    });
                });
            });
        });

        it("do not update", function(done) {
            uniqueQueue.push(0, false, function() {
                uniqueQueue.push(1, function() {
                    uniqueQueue.get(-1, function(err, messages) {
                        messages.should.eql(_stdMessages2);
                        done();
                    });
                });
            });
        });

        it("update", function(done) {
            uniqueQueue.push(0, true, function() {
                uniqueQueue.get(-1, function(err, messages) {
                    for(var i = 0; i < 9; i++) {
                        messages[i].should.eql(_stdMessages2[i + 1]);
                    }
                    messages[9].message.should.eql("0");
                    parseInt(messages[9].updatedAt).should.be.above(+new Date() - 2000).and.be.below(+new Date());
                    done();
                });
            });
        });
    });

    describe("#@when empty", function() {
        before(function(done) {
            uniqueQueue.removeAmount(-1, function() { done(); });
        });

        it("get message(s) from an empty queue", function(done) {
            uniqueQueue.get(10, function(err, messages) {
                messages.should.eql([]);
                done();
            });
        });

        it("get length from an empty queue", function(done) {
            uniqueQueue.length(function(err, l) {
                l.should.eql(0);
                done();
            });
        });

        it("get message(s) from an unexist queue", function(done) {
            redis.del([ uniqueQueue.queueName ], function() {
                uniqueQueue.get(10, function(err, messages) {
                    messages.should.eql([]);
                    done();
                });
            });
        });

        it("get length from an unexists queue", function(done) {
            uniqueQueue.length(function(err, l) {
                l.should.eql(0);
                done();
            });
        });
    });

    describe("#deleteQueue", function() {
        before(function(done) {
            uniqueQueue.push(10, function() { done(); });
        });
        
        it("delete a normal queue", function(done) {
            uniqueQueue.deleteQueue(function() {
                redis.exists([ uniqueQueue.queueName ], function(err, res) {
                    res.should.eql(0);
                    done();
                });
            });
        });
    });

    describe("#destroy", function() {
        it("destroy this instance", function(done) {
            uniqueQueue.destroy();
            (uniqueQueue.redis === undefined).should.eql(true);
            done();
        });

        it("get error when do something", function(done) {
            var scarlet = new Scarlet(10);
            scarlet.push(undefined, function(TO) {
                uniqueQueue.push(1, function(err) {
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

