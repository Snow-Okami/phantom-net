//REQUIRES
const kafka = require('no-kafka');
const redis = require('ioredis');
//OTHERS
const utils = require('../utilities/utilities');
//SETUP
const producer = new kafka.Producer();
const consumer = new kafka.SimpleConsumer();
const redisdb = new redis({
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  family: 4,           // 4 (IPv4) or 6 (IPv6)
  //password: 'auth',
  db: 0
});


module.exports = {
  initKafkaProducer : function() {
    producer.init().then(function(){

    })
    .then(function (result) {
      /*
      [ { topic: 'kafka-test-topic', partition: 0, offset: 353 } ]
      */
    });
  },

  initKafkaConsumer : function() {
    // data handler function can return a Promise
    var dataHandler = function (messageSet, topic, partition) {
        messageSet.forEach(function (m) {
            console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
        });
    };

    consumer.init().then(function () {
        // Subscribe partitons 0 and 1 in a topic:
        return consumer.subscribe('phantomnet', [0], dataHandler);
    });
  },

  sendMsgToKafka : function(msg) {
    producer.send({
        topic: 'phantomnet',
        partition: 0,
        message: {
            value: msg
        }
    });
  },

  initRedis : function() {

  },

  setRedisKeyValue : function(key, value) {
    redisdb.set(key, value);
  },

  getRedisKeyValue : function(key, cb) {
    redisdb.get(key, function (err, result) {
      if(err) {
        var errorMsg = `[${utils.getDateTimeNow()}] Failed to get Redis Value ${key}: ${err}`;
      }
      //Use a callback here because getting this is async
      cb(result);
    });
  },
}
