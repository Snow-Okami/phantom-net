const url = require('url');
//Original Websockets library
const WebSocket = require('ws');
//const WebSocket = require('uws');

//ENGINES
const socialengine = require('../services/socialengine');

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
    //Set status of user online
    socialengine.setStatus(username, 'online', () => {});
  },

  closeWs : function(ws) {
    //Hold the username before we remove the socket from the list!
    var wsclient = module.exports.getWsClientUsername(ws);
    //Socket removed from list here
    var client = CLIENTS.map(function(x) {return x.ws; }).indexOf(ws);
    if (client > -1) {
      CLIENTS.splice(client, 1);
      CLIENTS_NUM--;
      //Set status of user offline
      socialengine.setStatus(wsclient.username, 'offline', () => {});
    }
  },

  getUserWsClient : function(username) {
    var foundPos = CLIENTS.map(function(x) {return x.username; }).indexOf(username);
    if(foundPos > -1) {
        var client = CLIENTS[foundPos];
        return client;
    }
    else return -1;
  },

  getWsClientUsername : function(ws) {
    var foundPos = CLIENTS.map(function(x) {return x.ws; }).indexOf(ws);
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

  parseCommandRequest : function(requestObj) {
    //Gets the recipient from the input string
    var recip = utils.getFrontValueFromString(requestObj.message, constants.RECIPIENT_SEPARATOR);
    //Pop off the recipient from the string
    var cmdAndArgs = utils.popOffFrontValueFromString(requestObj.message, constants.RECIPIENT_SEPARATOR);
    //Gets the command from the input string
    var cmd = utils.getFrontValueFromString(cmdAndArgs, constants.COMMAND_SEPARATOR);
    //Gets the input string without the command
    var reqArgs = utils.popOffFrontValueFromString(cmdAndArgs, constants.COMMAND_SEPARATOR);
    //Gets arguments using argument seperators, in the form of KEY:VALUE in a object
    var args = utils.parseDelimitedString(reqArgs, constants.ARGUMENT_SEPARATOR, constants.ARGUMENT_VALUE_SEPARATOR);
    //Get websocket client
    var client = module.exports.getUserWsClient(recip);

    switch(cmd) {
      case 'sendpm':
        break;
      case 'sendchatinvite':
          break;
      case 'sendchatmsg':
          break;
      case 'frienduser':
      module.exports.onAddFriendRequest({client: client, username: recip, args: args});
          break;
      case 'blockuser':
          break;
      case 'unfrienduser':
          break;
      case 'unblockuser':
          break;
    }
  },

  parseCommandRequestOld : function(ws, request) {
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
      case 'sendpm':
        break;
      case 'sendchatinvite':
          break;
      case 'sendchatmsg':
          break;
      case 'frienduser':
          break;
      case 'blockuser':
          break;
      case 'unfrienduser':
          break;
      case 'unblockuser':
          break;
    }
  },

  onLoginRequest : function(user) {
      const username = user.username;
      const password = user.password;
      const ws = user.websocket;
      const type = 'Login';

      return module.exports.createResponse(type, {websocket: ws, success: false, msg: failureMsg});

  },

  onAddFriendRequest : function(user) {
    const username = user.username;
    const friend = user.args.friend;
    const type = 'frienduser';

    socialengine.addFriend(username, friend, (success) => {
      if(success) {
        var successMsg = `SUCCESSFULLY ADDED ${friend} TO ${username}'s FRIENDS LIST`
        console.log(successMsg);
        return module.exports.createResponse(type, user.client, { success: true, msg: successMsg });
      } else {
        var failureMsg = `FAILED TO ADD ${friend} TO ${username}'s TO FRIENDS LIST`
        console.log(failureMsg);
        return module.exports.createResponse(type, user.client , { success: false, msg: failureMsg });
      }
    });
  },

  onPmRequest : function(fromuser, touser) {
      // const username = user.username;
      // const password = user.password;
      // const ws = user.websocket;
      // const type = 'Login';
      //
      // return module.exports.createResponse(type, {websocket: ws, success: false, msg: failureMsg});

      // User.find({ users: { "$in" : ["sushi"]} }
      // User.findOne({ users: { }{ $all: [fromuser, touser] }});
  },

  createResponse : function(cmd, client, responseObj) {
    if(client.ws) {
      var responseCommands = utils.createDelimitedString(responseObj, constants.ARGUMENT_SEPARATOR, constants.ARGUMENT_VALUE_SEPARATOR);
      var finalResponse = `${cmd}${constants.COMMAND_SEPARATOR}${responseCommands}`;
      client.ws.send(finalResponse);
      MESSAGES++;
    }
  },

  send : function(ws, msg) {
      ws.send(msg);
      MESSAGES++;
  }
}
