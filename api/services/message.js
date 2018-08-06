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
  port: env.const.REDIS_PORT,
  host: env.const.REDIS_HOST,
  family: 4,
  db: 0
});

console.log('RedisDB is available at ' + env.const.REDIS_HOST + ':' + env.const.REDIS_PORT);

const message = {
  sendToRedis: (channel) => {
    publisher.publish(channel, data);
  },

  initRedis: () => {
    subscriber.subscribe(process.env.db);
    subscriber.on('message', function (channel, message) {
      var redisObj = { channel: channel, message: message };
      socket.parseCommandRequest(redisObj);
      console.log(`got msg ${message} from ${channel}`);
    });
  },

};

module.exports = message;