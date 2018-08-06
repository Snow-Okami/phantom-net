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
  sendToRedis: () => {

  }
};

module.exports = message;