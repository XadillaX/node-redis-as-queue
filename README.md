# Redis as Queue - Node.js SDK

A node.js package for regarding redis as a message queue.

## Installation

```sh
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

```javascript
var normalQueue = new raq.NormalQueue(QUEUE_NAME, [...]);
```

> **Note:** `[...]` is the option(s) to connect redis server. Refer to [node-redis document](https://www.npmjs.org/package/redis#redis-createclient-).

#### Create

