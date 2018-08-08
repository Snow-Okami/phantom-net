const kafka   = require('no-kafka');
const redis   = require('ioredis');
const utils   = require('../utils/');
const socket  = require('./socket');
const env     = require('../../environment/');

const producer = new kafka.Producer();
const consumer = new kafka.SimpleConsumer();
const subscriber = redis.createClient();
const publisher = redis.createClient();

const db = new redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  family: 4,
  db: 0
});

console.log('RedisDB is available at ' + process.env.REDIS_HOST + ':' + process.env.REDIS_PORT);

const message = {
  sendToRedis: async (channel, data) => {
    return await publisher.publish(channel, data);
  },

  sendToKafka: async (msg) => {
    await producer.init();
    return await producer.send({ topic: process.env.db, partition: 0, message: { value: msg } });
  },

  initRedis: async () => {
    await subscriber.subscribe(process.env.db);
    subscriber.on('message', async (channel, message) => {
      var redisObj = { channel: channel, message: message };
      return await socket.parseCommandRequest(redisObj);
      console.log(`got msg ${message} from ${channel}`);
    });
  },

  setRedis: async (key, value) => {
    return await db.set(key, value);
  },

  getRedis: async (key) => {
    let r;
    try {
      r = await db.get(key);
    } catch(e) {
      console.log(`[${utils.date()}] Failed to get Redis Value ${key}: ${e.message}`);
    }
    return r;
  }

};

module.exports = message;