
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const bycript   = require('../helpers/bcrypt');
const cloudinary = require('cloudinary');
const env_c = require('../../../environment/').cloudinary;
const env_m = require('../../../environment/').Mlab;
const env_v = require('../../../environment').ver;

var Id, User, Post, Chat, Message, Version;

const Models = {
  connect: async () => {
    let mongoUrl = `mongodb://${env_m.username}:${env_m.password}@${env_m.host}:${env_m.port}/${env_m.database}`;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    mongoose.set('useCreateIndex', true);
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      Models.create.id();
      Models.create.user();
      Models.create.post();
      Models.create.chat();
      Models.create.message();
      Models.create.version();
    });
  },

  joinCloudinary: async () => {
    cloudinary.config(env_c);
  },

  create: {

    /**
     * @description Initial id creator for all models.
     */
    id: async () => {
      let schema = new mongoose.Schema({
        user: { type: String, required: true, default: '0' },
        post: { type: String, required: true, default: '0' },
        chat: { type: String, required: true, default: '0' },
        message: { type: String, required: true, default: '0' }
      });
      Id = mongoose.model('Id', schema);

      /**
       * @description Find if id exists or not.
       */
      let l;
      try { l = await Models.objects.id.findOne({}); } catch(e) {}

      /**
       * @description Create ids if doesn't exists.
       */
      if(l.error) { try { await Models.objects.id.create({}); } catch(e) {} }
    },

    user: async () => {
      let schema = new mongoose.Schema({
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        fullName: { type: String },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        createdAt: { type: Date },
        jwtValidatedAt: { type: Date },
        emailValidated: { type: Boolean, default: false },
        allowedToAccess: { type: Boolean, default: false },
        isMale: { type: Boolean, required: true },
        avatar: { type: String, default: 'user.jpg' },
        capability: { type: Number, default: 2 },
        online: { type: Boolean, default: false },
        id: { type: String, required: true }, 
      });
      User = mongoose.model('User', schema);
    },

    post: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true }, 
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: { type: String },
        publish: { type: Boolean, required: true, default: false },
        image: { type: String, default: 'image.jpg' },
        createdAt: { type: Date, required: true }
      });
      Post = mongoose.model('Post', schema);
    },

    chat: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, unique: true, required: true },
        type: { type: Number, default: 0 },
        fullName: { type: String, default: '' },
        users: { type: [], default: [] },
        createdAt: { type: Date },
        updatedAt: { type: Date },
        admin: {
          email: { type: String, required: true },
          fullName: { type: String, required: true }
        },
        lastMessage: {
          text: { type: String, default: '' },
          createdBy: {
            email: { type: String },
            fullName: { type: String }
          },
          createdAt: { type: Date }
        },
        messages: { type: [], default: [] },
        isTyping: { show: { type: Boolean, default: false }, lastMessage: { cid: { type: String, default: '' }, createdBy: { email: { type: String, default: '' }, fullName: { type: String, default: '' } }, text: { type: String, default: '' } } }
      });
      Chat = mongoose.model('Chat', schema);
    },

    message: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, unique: true, required: true },
        cid: { type: String, required: true },
        text: { type: String, required: true },
        createdBy: {
          email: { type: String, required: true },
          fullName: { type: String, required: true }
        },
        createdAt: { type: Date, required: true }
      });
      Message = mongoose.model('Message', schema);
    },

    version: async () => {
      let schema = new mongoose.Schema({
        server: { type: String, required: true },
        clientLatest: { type: String, required: true },
        clientCurrent: { type: String, required: true },
        updatedAt: { type: Date, required: true }
      });
      Version = mongoose.model('Version', schema);

      /**
       * @description Find if id exists or not.
       */
      let l;
      try { l = await Models.objects.version.findOne({}); } catch(e) {}

      /**
       * @description Create ids if doesn't exists.
       */
      if(l.error) { try { await Models.objects.version.create(env_v); } catch(e) {} }
      else { try { await Models.objects.version.updateOne({ clientLatest: env_v.clientCurrent }, env_v, {}); } catch(e) {} }
    },

  },

  bycript: bycript,

  _: _,

  objects: {

    user: {
      /**
       * @description finds one user only with matching parameter.
       */
      findOne: async (param) => {
        let r;
        try { r = await User.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'user doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available user in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await User.find(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no user found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates one user with required parameters.
       * @param param looks like {firstName: String, lastName: String, email: String, password: String, id: String, avatar: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time, jwtValidatedAt: time };
        Object.assign(param, ext);
        try {
          if(param.password) { param.password = await bycript.hash(param.password); }
          r = await User.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create user!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes only one user matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        let r;
        try { r = await User.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'email doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates only one user at a time. If parameter contains password it updates jwtValidatedAt.
       */
      updateOne: async (query, param, option) => {
        let r, time = new Date().getTime(), ext = { jwtValidatedAt: time };
        try {
          if(param.password) {
            Object.assign(param, ext);
            param.password = await bycript.hash(param.password);
          }
          r = await User.updateOne(query, param, option);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'email doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

    post: {
      /**
       * @description finds one post only with matching parameter.
       */
      findOne: async (param) => {
        let p;
        try { p = await Post.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'post doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds limited of the available posts in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try { r = await Post.find(query).sort({ createdAt: option.sort }).skip(option.skip).limit(option.limit); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no post found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available posts in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await Post.find(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no post found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description posts an update with required parameters.
       * @param param looks like {title: String, description: String, publish: Boolean, id: String, image: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time };
        Object.assign(param, ext);
        try {
          r = await Post.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t post update!' } }; }
        return { message: { type: 'success' }, data: r };
      },
      
      /**
       * @description Uploads image files to the Cloudinary server.
       */
      uploadImage: async (param) => {
        let r;
        try {
          r = await cloudinary.v2.uploader.upload(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t post update!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

    chat: {
      /**
       * @description finds one chat only with matching parameter.
       */
      findOne: async (param) => {
        let p;
        try { p = await Chat.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'chat doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds limited of the available chats in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try { r = await Chat.find(query).sort({ updatedAt: option.sort }).skip(option.skip).limit(option.limit); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available chats in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await Chat.find(param).sort({ updatedAt: -1 }); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description posts an update with required parameters.
       * @param param looks like {title: String, description: String, publish: Boolean, id: String, image: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time, updatedAt: time };
        Object.assign(param, ext);
        try { r = await Chat.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create chat!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes only one chat matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        let r;
        try { r = await Chat.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'chat doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates only one user at a time. If parameter contains password it updates jwtValidatedAt.
       */
      updateOne: async (query, param, option) => {
        let r;
        try { r = await Chat.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'chat doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

    message: {
      /**
       * @description finds limited of the available message in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try { r = await Message.find(query).sort({ createdAt: option.sort }).skip(option.skip).limit(option.limit); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: _.reverse(r) };
      },
      /**
       * @description creates a message with required parameters.
       * @param param looks like {title: String, description: String, publish: Boolean, id: String, image: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time };
        Object.assign(param, ext);
        try { r = await Message.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create message!' } }; }
        return { message: { type: 'success' }, data: r };
      },
    },

    id: {
      /**
       * @description finds one user only with matching parameter.
       */
      findOne: async (param) => {
        let r;
        try { r = await Id.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'id doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates one user with required parameters.
       * @param param looks like {firstName: String, lastName: String, email: String, password: String}.
       */
      create: async (param) => {
        let r;
        try {
          r = await Id.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create id!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates only one id at a time.
       */
      updateOne: async (query, param, option) => {
        let r;
        try {
          r = await Id.updateOne(query, param, option);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'id doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

    },

    version: {
      /**
       * @description finds the version update from server.
       */
      findOne: async (param) => {
        let r;
        try { r = await Version.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'version doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates the version update for clients.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { updatedAt: time };
        Object.assign(param, ext);
        try { r = await Version.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create version!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates the available version on the server.
       */
      updateOne: async (query, param, option) => {
        let r, time = new Date().getTime(), ext = { updatedAt: time };
        Object.assign(param, ext);
        try { r = await Version.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'version doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

  }
};

module.exports = Models;