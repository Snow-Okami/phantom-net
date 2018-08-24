const mongoose  = require('mongoose');
var Chat;

const db = {
  connect: async () => {
    let mongoUrl = 'mongodb://127.0.0.1:27017/SocketDatabase';
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    let connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', () => {
      console.log('MongoDB is available at mongodb://127.0.0.1:27017/SocketDatabase');
      db.create.chat();
    });
  },

  create: {
    chat: async () => {
      let schema = new mongoose.Schema({
        handle: { type: String },
        message: { type: String }
      });
      Chat = mongoose.model('Chat', schema);
    }
  },

  models: {
    chat: {
      create: async (params) => {
        return await Chat.create(params);
      },
      find: async () => {
  
      },
      findOne: async () => {
  
      }
    },


  },

};

module.exports = db;