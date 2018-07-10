//REQUIRES
const kafka = require('no-kafka');
const redis = require('ioredis');
//ENGINES
const socketengine = require('../services/socketengine');
//OTHERS
const utils = require('../utilities/utilities');
//SETUP
const kProducer = new kafka.Producer();
const kConsumer = new kafka.SimpleConsumer();
const rSubscriber = redis.createClient();
const rPublisher = redis.createClient();

const redisdb = new redis({
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  family: 4,           // 4 (IPv4) or 6 (IPv6)
  //password: 'auth',
  db: 0
});


module.exports = {

  initKafkaProducer : function() {
    kProducer.init().then(function(){

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
          var kafkaObj = { topic: topic, partition: partition, offset: m.offset, message: m.message.value.toString('utf8') };
          socketengine.parseCommandRequest(kafkaObj);
          console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
        });
        //return Promise.delay(1000);
    };

    kConsumer.init().then(function () {
        // Subscribe partitons 0 and 1 in a topic:
        return kConsumer.subscribe('phantomnet', [0], dataHandler);
    });
  },

  sendMsgToKafka : function(msg) {
    kProducer.send({
        topic: 'phantomnet',
        partition: 0,
        message: {
            value: msg
        }
    });
  },

  initRedis : function() {
    //Subscribe to all redis global channel events
    rSubscriber.subscribe('phantomnet');
    //Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
    rSubscriber.on('message', function (channel, message) {
      //Msgs received here
      var redisObj = { channel: channel, message: message };
      socketengine.parseCommandRequest(redisObj);
      console.log(`got msg ${message} from ${channel}`);
    });
  },

  sendMsgToRedis : function(channel, data) {
    rPublisher.publish(channel, data);
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
