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

#### Get

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

#### Remove

To remove message(s) from your redis queue, you may use `removeAmount` function.

##### Remove earlist one message

```javascript
normalQueue.removeAmount(function(err) {
    console.log(err);
});
```

##### Remove earlist N message(s)

```javascript
normalQueue.removeAmount(5, function(err) {
    console.log(err);
});
```

##### Remove all the message(s)

```javascript
normalQueue.removeAmount(-1, function(err) {
    console.log(err);
});
```

#### Length

Get the length of current queue.

```javascript
normalQueue.length(function(err, len) {
    console.log(len);
});
```

### Unique Queue

Each message in unique queue is unique.

#### Create

```javascript
var uniqueQueue = new raq.UniqueQueue(QUEUE_NAME, [...]);
```

> **Note:** `[...]` is the option(s) to connect redis server. Refer to [node-redis document](https://www.npmjs.org/package/redis#redis-createclient-).
>
> Eg.
>
> ```javascript
> new raq.UniqueQueue(QUEUE_NAME, 6379, '127.0.0.1', {});
> new raq.UniqueQueue(QUEUE_NAME, unix_socket, options);
> ...
> ```

#### Push

Push a message to the queue.

##### Need update

This call will check if your message is existing. If existing, it will move the previous message to the end of queue. Otherwise, your message will be pushed at the end of queue.

```javascript
uniqueQueue.push("YOUR_MESSAGE", true, function(err) {
    console.log(err);
});
```

##### Do not update

This call will check if your message is existing. If existing, it won't do anything. Otherwise, your message will be pushed at the end of queue.

```javascript
uniqueQueue.push("YOUR_MESSAGE", function(err) {
    console.log(err);
});

// or you can do this

uniqueQueue.push("YOUR_MESSAGE", false, function(err) {
    console.log(err);
});
```

#### Get

##### Get first message

```javascript
uniqueQueue.get(function(err, messages) {
    console.log(err);
    if(messages.length) {
        console.log(messages[0].message);
        console.log(messages[0].updatedAt);
    }
});
```

##### Get first N message(s)

```javascript
uniqueQueue.get(3, function(err, messages) {
    console.log(err);
    for(var i = 0; i < messages.length; i++) {
        console.log(messages[i].message);
        console.log(messages[i].updatedAt);
    }
});
```

##### Get all the message(s)

```javascript
uniqueQueue.get(-1, function(err, messages) {
    console.log(err);
    for(var i = 0; i < messages.length; i++) {
        console.log(messages[i].message);
        console.log(messages[i].updatedAt);
    }
});
```

#### Remove Amount

Refer to [remove section](#remove) in **Normal Queue**.

#### Remove Messages

Remove one or more certain message(s) in the queue.

```javascript
uniqueQueue.get(10, function(err, messages) {
    for(var i = 0; i < 5; i++) messages.shift();

    // Remove Messages
    uniqueQueue.removeMessages(messages, function(err, removeCount, notRemovedMessages) {
        console.log(err);
        console.log(removeCount);
        for(var i = 0; i < notRemovedMessages.length; i++) console.log(notRemovedMessages[i].message);
    });
});
```

#### Length

Refer to [length section](#length) in **Normal Queue**.

### Common Functions

#### Delete Queue

Delete this queue key and values in redis.

```javascript
uniqueQueue.deleteQueue(function() {});
normalQueue.deleteQueue(function() {});
```

#### Destroy Queue Object

Let the queue object disconnect from redis server and let this instance can't do any other thing any more.

```javascript
uniqueQueue.destroy();
normalQueue.destroy();
```

## Contribute

You're welcome to pull requests!

> 「雖然我覺得不怎麼可能有人會關注我」

