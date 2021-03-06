require('dotenv').config();
const mongoose  = require('mongoose');
const bycript   = require('../helpers/password');
var Admin, Chat, ChatList, Message, AuthUser, User, Friend, Post;

const models = {
  connect: async () => {
    let mongoUrl = 'mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    mongoose.set('useCreateIndex', true);
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('MongoDB is available at mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db);
      models.create.admin();
      models.create.authenticate();
      models.create.user();
      models.create.chat();
      models.create.chatList();
      models.create.message();
      models.create.friend();
      models.create.post();
    });
  },

  create: {
    admin: async () => {
      let schema = new mongoose.Schema({
        name: { type: String },
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
        /**
         * @description fname and lname will be replaced by name for better usage.
         */
        name: { type: String, required: true },
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
      });
      User = mongoose.model('User', schema);
    },

    chat: async () => {
      let schema = new mongoose.Schema({
        name: { type: String, default: 'Chat' },
        type: { type: String, default: 'private' },
        admin: { type: String, default: '' }
      });
      Chat = mongoose.model('Chat', schema);
    },

    chatList: async () => {
      let schema = new mongoose.Schema({
        chatId: { type: String, required: true },
        type: { type: String, required: true },
        member: { type: String, required: true },
        /**
         * @description member will be replaced by username for better usage.
         */
        username: { type: String, required: true },
        agreed: { type: Boolean, default: false },
        updatedAt: { type: Date }
      });
      ChatList = mongoose.model('ChatList', schema);
    },

    message: async () => {
      let schema = new mongoose.Schema({
        text: { type: String, required: true },
        chatId: { type: String, required: true },
        type: { type: String, required: true },
        createdAt: { type: Date, required: true },
        to: { type: String, required: true },
        createdBy: { type: String, required: true },
        archived: { type: Boolean, default: false },
        edited: { type: Boolean, default: false }
      });
      Message = mongoose.model('Message', schema);
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

  /**
   * @description Each modle should have findOne, findLimited, findAll, create, updateOne, deleteOne
   */
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

    },
    comparePassword: async (raw, hash) => {
      let v;
      try {
        v = await bycript.compare(raw, hash);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return v;
    }
  },

  user: {
    findOne: async (param) => {
      let r;
      try {
        r = await User.findOne(param);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      if(!r) { return { error: { type: 'error', text: 'username doesn\'t exists!' } }; }
      return r;
    },
    /**
     * @param : (query: is used to find, skip: no. of records to skip after find, limit: total no. of records to be returned)
     */
    findLimited: async (query, skip, limit) => {
      let r;
      try {
        r = await User.find(query).skip(skip).limit(limit);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return r;
    },
    /**
     * @deprecated: Please use findAll in place of find. We are removing find permanently.
     */
    find: async (param) => {
      console.log('Please use findAll in place of find. We are removing find very soon.');
      let r;
      try {
        r = await User.find(param);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return r;
    },
    findAll: async (param) => {
      let r;
      try {
        r = await User.find(param);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
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
        return { error: { type: 'error', text: e.message } };
      }
      // if(!r) { return { error: 'chatId doesn\'t exists!' }; }
      return r;
    },
    findAll: async (param) => {
      let r;
      try {
        r = await Chat.find(param);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return r;
    },
    create: async (param) => {
      let r;
      try {
        r = await Chat.create(param);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
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
        return { error: { type: 'error', text: e.message } };
      }
      if(!r) { return { error: { type: 'error', text: 'Chat doesn\'t exists!' } }; }
      return r;
    },
    find: async (param) => {
      let r;
      try {
        r = await ChatList.find(param).limit(100);
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
    addMany: async (param) => {
      let r;
      try {
        r = await ChatList.insertMany(param);
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
    },
    update: async (query, param, option) => {
      let r;
      try {
        r = await ChatList.update(query, param, option);
      } catch(e) {
        return { error: e.message };
      }
      return r;
    }
  },

  message: {
    find: async (param, skip) => {
      let r;
      try {
        r = await Message.find(param).sort({ createdAt: -1 }).skip(skip).limit(20);
        _.reverse(r);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return r;
    },
    findOne: async (param) => {
      let r;
      try {
        /**
         * Aggregation Needed For This Find
         */
        r = await Message.find(param).sort({ createdAt: -1 });
        _.reverse(r);
      } catch(e) {
        return { error: { type: 'error', text: e.message } };
      }
      return r;
    },
    create: async (param) => {
      let time = new Date().getTime();
      let r;
      try {
        r = await Message.create(Object.assign(param, { 'createdAt': time }));
      } catch(e) {
        return { success: false, error: e.message };
      }
      return r;
    },
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
        return { success: false, error: e.message };
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