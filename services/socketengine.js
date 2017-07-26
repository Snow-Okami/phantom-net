const url = require('url');
//Original Websockets library
const WebSocket = require('ws');
//const WebSocket = require('uws');

//CUSTOM
const constants = require('../utilities/constants');
const utils = require('../utilities/utilities');
const User = require('../models/user');

var CLIENTS = [];
var CLIENTS_NUM = 0;
var MESSAGES = 0;

module.exports = {

  openWs : function(ws, username) {
    CLIENTS.push({ws: ws, username: username});
    CLIENTS_NUM++;
  },

  closeWs : function(ws) {
    var client = CLIENTS.map(function(x) {return x.ws; }).indexOf(ws);
    if (client > -1) {
      CLIENTS.splice(client, 1);
      CLIENTS_NUM--;
    }
  },

  getUserWs : function(username) {
    var foundPos = CLIENTS.map(function(x) {return x.username; }).indexOf(username);
    if(foundPos > -1) {
        var client = CLIENTS[foundPos];
        return client;
    }
    else return -1;
  },

  sendToUser : function(username, msg) {
    // Broadcast to everyone else.
    var client = module.exports.getUserWs(username);
    if(client === -1) {
      return false;
    } else {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
        MESSAGES++;
        return true;
      }
    }
  },

  sendAllClients : function(msg) {
    // Broadcast to everyone else.
    CLIENTS.forEach(function each(client) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
        MESSAGES++;
      }
    });
  },

  sendAllClientsExcept : function(ws, msg) {
    // Broadcast to everyone else.
    CLIENTS.forEach(function each(client) {
      if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
        MESSAGES++;
      }
    });
  },

  //Keep alive for connection functionality (contained in 3 functions: heartbeat ping, pong)
  heartbeat : function() {
    this.isAlive = true;
  },

  pong : function(ws) {
    ws.isAlive = true;
    ws.on('pong', module.exports.heartbeat);
  },

  ping : function() {
    setInterval(() => {
      CLIENTS.forEach(function each(client) {
        if (client.ws.isAlive === false) {
          module.exports.closeWs(client.ws);
          return client.ws.terminate();
        }
        client.ws.isAlive = false;
        client.ws.ping('', false, true);
      });
    }, constants.KEEP_ALIVE_HEARTBEAT_INTERVAL);
  },

  parseCommandRequest : function(ws, request) {
    //Gets the command from the input string
    var cmd = request.split(constants.COMMAND_SEPARATOR)[0];
    //Gets the input string without the command
    var reqArgs = request.split(constants.COMMAND_SEPARATOR).pop();
    //Gets arguments  using argument seperators, in the form of KEY:VALUE
    var args = reqArgs.split(constants.ARGUMENT_SEPARATOR);
    //Creates a list of these KEY:VALUE arguments
    var argPairs = [];
    //Pushes each key value pair to an array of objects with custom keys
    for(var i = 0; i < args.length; i++) {
      //Get name (key)
      var name = args[i].split(constants.ARGUMENT_VALUE_SEPARATOR)[0];
      //Get value (value)
      var value = args[i].split(constants.ARGUMENT_VALUE_SEPARATOR)[1];
      //Create object
      var customKeyValuePair = {};
      //Set custom key value
      customKeyValuePair[name] = value;
      //Push it onto the array
      argPairs.push(customKeyValuePair);
    }
    switch(cmd) {
      case 'login':
        module.exports.onLoginRequest({websocket: ws, username: utils.getKeyFromObj(argPairs[0]), password: utils.getValueFromKey(argPairs[0])});
        break;
    }
  },

  onLoginRequest : function(user) {
      const username = user.username;
      const password = user.password;
      const ws = user.websocket;
      const type = 'Login';

      User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user) {
          var failureMsg = `Failed to authenticate. User ${username} not found!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          return module.exports.createResponse(type, {websocket: ws, success: false, msg: failureMsg});
        }
        //Prevent locked accounts from trying to authenticate
        if(user.locked) {
          var failureMsg = `Failed to authenticate. User ${username} account is locked!`;
          console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
          return module.exports.createResponse(type, {websocket: ws, success: false, msg: failureMsg});
        }

      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          user.save((err) => {
            if(err) { console.log(err); throw err; }
            else {
              //Setup success msg
              var successMsg = `Successfully authenticated user ${username}!`;
              console.log(`[${utils.getDateTimeNow()}] ${successMsg}`);
              return module.exports.createResponse(type, {websocket: ws, success: true, msg: successMsg});
            }
          });
        }
        else {
          //Save User
          user.save((err) => {
            if(err)  { console.log(err); throw err; }
            else {
              var failureMsg = `Wrong password for user ${username}! - Failed Logins: ${user.failedloginattempts}!`;
              console.log(`[${utils.getDateTimeNow()}] ${failureMsg}`);
              return module.exports.createResponse(type, {websocket: ws, success: false, msg: failureMsg});
            }
          });
        }
      });
    });
  },
  createResponse : function(command, response) {
    var ws = response.websocket;
    if(ws) {
      var finalResponse = `${command}${constants.COMMAND_SEPARATOR}success${constants.ARGUMENT_VALUE_SEPARATOR}${response.success}${constants.ARGUMENT_SEPARATOR}msg${constants.ARGUMENT_VALUE_SEPARATOR}${response.msg}`;
      ws.send(finalResponse);
      MESSAGES++;
    }
  },

  send : function(ws, msg) {
      ws.send(msg);
      MESSAGES++;
  }
}
