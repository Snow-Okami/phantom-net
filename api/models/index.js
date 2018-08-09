require('dotenv').config();
const mongoose  = require('mongoose');
const bycript   = require('../helpers/password');
var Admin, Chat, ChatList, AuthUser, User, Friend, Post;

const models = {
  connect: async () => {
    let mongoUrl = 'mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('MongoDB is available at mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db);
      models.create.admin();
      models.create.authenticate();
      models.create.user();
      models.create.chat();
      models.create.chatList();
      models.create.friend();
      models.create.post();
    });
  },

  create: {
    admin: async () => {
      let schema = new mongoose.Schema({
        fname: { type: String },
        lname: { type: String },
        email: { type: String, required: true },
        createdAt: { type: Date },
        jwtValidatedAt: { type: Date },
      });
      Admin = mongoose.model('Admin', schema);
    },

    authenticate: async () => {
      let schema = new mongoose.Schema({
        email: { type: String, unique: true },
        time: { type: Date }
      });
      AuthUser = mongoose.model('AuthUser', schema);
    },

    user: async () => {
      let schema = new mongoose.Schema({
        fname: { type: String },
        lname: { type: String },
        filename: { type: String, default: 'avatar.png' },
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        createdAt: { type: Date },
        jwtValidatedAt: { type: Date },
        emailValidated: { type: Boolean, default: false },
        status: { type: String, default: 'offline' },
        locked: { type: Boolean, default: false },
        chatId: { type: String },
        partChatId: { type: String },
      });
      User = mongoose.model('User', schema);
    },

    chat: async () => {
      let schema = new mongoose.Schema({
        name: { type: String },
        type: { type: String, default: 'private' }
      });
      Chat = mongoose.model('Chat', schema);
    },

    chatList: async () => {
      let schema = new mongoose.Schema({
        chatId: { type: String },
        type: { type: String },
        username: { type: String }
      });
      ChatList = mongoose.model('ChatList', schema);
    },

    friend: async () => {
      let schema = new mongoose.Schema({
        username: { type: String, required: true },
        friendname: { type: String, required: true },
      });
      Friend = mongoose.model('Friend', schema);
    },

    post: async () => {
      let schema = new mongoose.Schema({
        title: { type: String, required: true },
        createdAt: { type: Date },
        createdBy: { type: String },
        description: { type: String, required: true },
        published: { type: Boolean, required: true },
        filename: { type: String, required: true },
      });
      Post = mongoose.model('Post', schema);
    }
  },

  authUser: {
    findOne: async () => {

    },
    create: async (param) => {
      let r, time = new Date().getTime();
      try {
        let f = await AuthUser.findOne({ 'email': param.email });
        if(!f) { r = await AuthUser.create({ 'email': param.email, 'time': time }); }
        else {
          await AuthUser.update({ 'email': f.email }, { 'time': time });
          r = { 'email': f.email, 'time': time };
        }
      } catch(e) {
        return { success: false, error: e.message };
      }
      return r;
    },
    update: async () => {

    }
  },

  user: {
    find: async (param) => {
      const r = await User.find({ name: 'Abhisek Dutta' });
      return r;
    },
    findOne: async (param) => {
      let r;
      try {
        r = await User.findOne(param);
      } catch(e) {
        return { error: e.message };
      }
      if(!r) { return { error: 'username doesn\'t exists!' }; }
      return r;
    },
    create: async (param) => {      
      let r, time = new Date().getTime(), ext = { createdAt: time, jwtValidatedAt: time };
      Object.assign(param, ext);
      try {
        if(param.password) { param.password = await bycript.hash(param.password); }
        r = await User.create(param);
      } catch(e) {
        return { success: false, error: e.message };
      }
      Object.assign(r, { 'password': '' });
      return r;
    },
    update: async (query, param, option) => {
      let r, time = new Date().getTime(), ext = { jwtValidatedAt: time };
      try {
        if(param.password) {
          Object.assign(param, ext);
          param.password = await bycript.hash(param.password);
        }
        r = await User.update(query, param, option);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    },
    delete: async (params) => {
      const r = await User.deleteOne(params);
      return r;
    }
  },

  chat: {
    findOne: async (param) => {
      let r;
      try {
        r = await Chat.findOne(param);
      } catch(e) {
        return { error: e.message };
      }
      if(!r) { return { error: 'chatId doesn\'t exists!' }; }
      return r;
    },
    create: async (param) => {
      let r;
      try {
        r = await Chat.create(param);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    }
  },

  chatList: {
    findOne: async (param) => {
      let r;
      try {
        r = await ChatList.findOne(param);
      } catch(e) {
        return { error: e.message };
      }
      if(!r) { return { error: 'Chat doesn\'t exists!' }; }
      return r;
    },
    find: async (param) => {
      let r;
      try {
        r = await ChatList.find(param);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    },
    add: async (param) => {
      let r;
      try {
        r = await ChatList.create(param);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    },
    deleteOne: async (param) => {
      let r;
      try {
        r = await ChatList.deleteOne(param);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    }
  },

  friend: {
    find: async (param) => {
      const r = await Friend.find(param);
      return r;
    },
    create: async (param) => {
      let r;
      try {
        r = await Friend.create(param);
      } catch(e) {
        return { success: false, error: e.errmsg };
      }
      return r;
    },
  },

  post: {
    find: async (param) => {
      const r = await Post.find(param);
      return r;
    },
    create: async (req) => {
      const r = await Post.create(Object.assign(req.body, { 'filename': req.file.filename }));
      return r;
    },
    update: async (param) => {
      const r = await Post.updateOne({ name: 'Feeling Luckey' });
      return r;
    },
    delete: async () => {
      const r = await Post.deleteOne({ name: 'Feeling Luckey' });
      return r;
    }
  }

};

module.exports = models;