# Redis as Queue - Node.js SDK

A node.js package for regarding redis as a message queue.

## Installation

```shell
$ npm install redis-as-queue
```

## Usage

There are two kinds of queue - normal queue and unique queue.

Each value in unique queue is unique. If a new value that equals any value in the queue, you may choose to update or not.

First you should require this package:

```javascript
var raq = require("redis-as-queue");
```

### Normal Queue

#### Create

```javascript
var normalQueue = new raq.NormalQueue(QUEUE_NAME, [...]);
```

> **Note:** `[...]` is the option(s) to connect redis server. Refer to [node-redis document](https://www.npmjs.org/package/redis#redis-createclient-).
>
> Eg.
>
> ```javascript
> new raq.NormalQueue(QUEUE_NAME, 6379, '127.0.0.1', {});
> new raq.NormalQueue(QUEUE_NAME, unix_socket, options);
> ...
> ```

#### Push

To push a message to your queue, you may use this function:

```javascript
normalQueue.push("YOUR MESSAGE", function(err) {
    console.log(err);
});
```

#### Pop

To get message(s) from your redis queue, you may use `get` function.

##### Get earlist one message

```javascript
normalQueue.get(function(err, messages) {
    console.log(err);
    if(messages.length) console.log(messages[0]);
});
```

##### Get earlist N message(s)

```javascript
// This call gets 10 earlist messages
normalQueue.get(10, function(err, messages) {
    console.log(err);
    for(var i = 0; i < messages.length; i++) console.log(messages[i]);
});
```

##### Get all message(s)

```javascript
normalQueue.get(-1, function(err, messages) {
    console.log(err);
    for(var i = 0; i < messages.length; i++) console.log(messages[i]);
});
```

