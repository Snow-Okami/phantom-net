const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const bycript   = require('../helpers/bcrypt');
const cloudinary = require('cloudinary');
const nodemailer = require('nodemailer');
const env_c = require('../../../environment/').cloudinary;
const env_m = require('../../../environment/').Mlab;
const env_v = require('../../../environment').ver;
const env_g = require('../../../environment/').Google;

var Id, User, Post, Comment, Reply, Chat, Message, Version, Vcode, Achievement, News;

const Models = {

  data: {
    comRepCreatedBy: ['avatar', 'capability', 'firstName', 'lastName', 'username', 'email', 'fullName', 'id', '_id']
  },

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
      Models.create.comment();
      Models.create.reply();
      Models.create.chat();
      Models.create.message();
      Models.create.version();
      Models.create.vcode();
      Models.create.achievement();
      Models.create.news();
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
        comment: { type: String, required: true, default: '0' },
        reply: { type: String, required: true, default: '0' },
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
        username: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true },
        jwtValidatedAt: { type: Date, required: true },
        emailValidated: { type: Boolean, default: false },
        allowedToAccess: { type: Boolean, default: false },
        isMale: { type: Boolean, required: true },
        avatar: { type: String, default: '' },
        capability: { type: Number, default: 1 },
        online: { type: Boolean, default: false },
        id: { type: String, required: true },
        verificationCodes: [{ type: Schema.Types.ObjectId, ref: 'Vcode' }]
      });
      User = mongoose.model('User', schema);
    },

    achievement: async() => {
      let schema = new mongoose.Schema({
        title: { type: String, required: true },
        description: { type: String, required: true },
        thumbnail: { type: String, default: '' },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true }
      });
      Achievement = mongoose.model('Achievement', schema);
    },

    /**
     * @description Reset codes for password reset.
     */
    vcode: async () => {
      let schema = new mongoose.Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, required: true }
      });
      Vcode = mongoose.model('Vcode', schema);
    },

    post: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true }, 
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: { type: String },
        publish: { type: Boolean, required: true, default: false },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        image: { type: String, default: '' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, required: true }
      });
      Post = mongoose.model('Post', schema);
    },

    news: async () => {
      let schema = new mongoose.Schema({
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true },
      });
      News = mongoose.model('News', schema);
    },

    comment: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true },
        text: { type: String, required: true },
        createdFor: { type: Schema.Types.ObjectId, ref: 'Post' },
        replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, required: true }
      });
      Comment = mongoose.model('Comment', schema);
    },

    reply: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true },
        text: { type: String, required: true },
        createdFor: { type: Schema.Types.ObjectId, ref: 'Comment' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, required: true }
      });
      Reply = mongoose.model('Reply', schema);
    },

    chat: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, unique: true, required: true },
        type: { type: Number, default: 0 },
        fullName: { type: String, default: '' },
        users: [{ type: Schema.Types.ObjectId, ref: 'User'}],
        createdAt: { type: Date },
        updatedAt: { type: Date },
        admin: { type: Schema.Types.ObjectId, ref: 'User'},
        lastMessage: {
          text: { type: String, default: '' },
          createdBy: {
            username: { type: String },
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
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

  ObjectId: ObjectId,

  bycript: bycript,

  _: _,

  objects: {

    user: {
      countAll: async (param) => {
        let u;
        try { u = await User.countDocuments(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!u) { return { error: { type: 'error', text: 'user doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: u };
      },
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
        let r, time = new Date().getTime(), ext = { createdAt: time, updatedAt: time, jwtValidatedAt: time };
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
          Object.assign(param, { updatedAt: time });
          r = await User.updateOne(query, param, option);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'email doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

    vcode: {
      /**
       * @description finds one user only with matching parameter.
       */
      findOne: async (param) => {
        let r;
        try { r = await Vcode.findOne(param).populate('user'); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'vcode doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates one user with required parameters.
       * @param param looks like 
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time };
        Object.assign(param, ext);
        try {
          r = await Vcode.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create vcode!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes only one user matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        let r;
        try { r = await Vcode.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'vcode doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes many records after matching only user with the parameters from Mlab database.
       */
      deleteMany: async (param) => {
        let r;
        try { r = await Vcode.deleteMany(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'vcode doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },
    },

    achievement: {
      /**
       * @description finds one achievement only with matching parameter.
       */
      findOne: async (param) => {
        let r;
        try { r = await Achievement.findOne(param).populate({ path: 'users', select: Models.data.comRepCreatedBy }); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'achievement doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available achievements in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await Achievement.find(param).populate({ path: 'users', select: Models.data.comRepCreatedBy }); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no achievement found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates one achievement with required parameters.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time, updatedAt: time };
        Object.assign(param, ext);
        try {
          r = await Achievement.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create achievement!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      updateOne: async (query, param, option) => {
        let r, time = new Date().getTime(), ext = { updatedAt: time };
        Object.assign(param, ext);
        try { r = await Achievement.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'achievement doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      deleteOne: async (param) => {
        let r;
        try { r = await Achievement.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'achievement doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },
    },

    news: {
      /**
       * @description finds one news only with matching parameter.
       */
      findOne: async (param) => {
        let n;
        try { n = await News.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!n) { return { error: { type: 'error', text: 'news doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: n };
      },

      /**
       * @description finds limited of the available newses in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try { r = await News.find(query).sort({createdAt: option.sort }).skip(option.skip).limit(option.limit); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no news found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available newses in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await News.find(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no news found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description creates a news with required parameters.
       * @param param looks like {headline: String, content: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time, updatedAt: time };
        Object.assign(param, ext);
        try { r = await News.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create news!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates only one news at a time.
       */
      updateOne: async (query, param, option) => {
        let r, time = new Date().getTime(), ext = { updatedAt: time };
        Object.assign(param, ext);
        try { r = await News.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'news doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      deleteOne: async (param) => {
        let r;
        try { r = await News.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'news doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }

    },

    post: {
      /**
       * @description finds one post only with matching parameter.
       */
      findOne: async (param) => {
        let p;
        try {
          p = await Post.findOne(param).populate({
            path: 'comments', options: { sort: { createdAt: -1 } },
            populate: [
              { path: 'replies', options: { limit: 4 }, populate: [{ path: 'createdBy', select: Models.data.comRepCreatedBy }, { path: 'createdFor' }] },
              { path: 'createdBy', select: Models.data.comRepCreatedBy }
            ]
          });
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'post doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds limited of the available posts in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try {
          r = await Post.find(query).sort({createdAt: option.sort }).skip(option.skip).limit(option.limit).populate({
            path: 'comments', options: { sort: { createdAt: -1 } },
            populate: [
              { path: 'replies', options: { limit: 4 }, populate: [{ path: 'createdBy', select: Models.data.comRepCreatedBy }, { path: 'createdFor' }] },
              { path: 'createdBy', select: Models.data.comRepCreatedBy }
            ]
          });
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no post found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available posts in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try {
          r = await Post.find(param).populate({
            path: 'comments', options: { sort: { createdAt: -1 } },
            populate: [
              { path: 'replies', options: { limit: 4 }, populate: [{ path: 'createdBy', select: Models.data.comRepCreatedBy }, { path: 'createdFor' }] },
              { path: 'createdBy', select: Models.data.comRepCreatedBy}
            ]
          });
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
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
       * @description updates only one user at a time. If parameter contains password it updates jwtValidatedAt.
       */
      updateOne: async (query, param, option) => {
        let r;
        try { r = await Post.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'post doesn\'t exists!' } }; }
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

    comment: {
      /**
       * @description finds one chat only with matching parameter.
       */
      findOne: async (param) => {
        try {
          p = await Comment.findOne(param).populate([
            { path: 'createdBy', select: Models.data.comRepCreatedBy },
            { path: 'replies', populate: [{ path: 'createdBy', select: Models.data.comRepCreatedBy }, { path: 'createdFor' }] },
            { path: 'createdFor' }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'comment doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds all the available chats in the Mlab database.
       */
      findAll: async (param) => {
        try {
          r = await Comment.find(param).sort({ updatedAt: -1 }).populate([
            { path: 'createdBy', select: Models.data.comRepCreatedBy },
            { path: 'replies', populate: [{ path: 'createdBy', select: Models.data.comRepCreatedBy }, { path: 'createdFor' }] },
            { path: 'createdFor' }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no comment found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description posts an update with required parameters.
       * @param param 
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time };
        Object.assign(param, ext);
        try { r = await Comment.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create comment!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description updates only one comment at a time.
       */
      updateOne: async (query, param, option) => {
        let r;
        try { r = await Comment.updateOne(query, param, option); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'comment doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },
    },

    reply: {
      /**
       * @description finds one chat only with matching parameter.
       */
      findOne: async (param) => {
        try {
          p = await Reply.findOne(param).populate([
            { path: 'createdBy', select: Models.data.comRepCreatedBy },
            { path: 'createdFor' }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'reply doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds all the available chats in the Mlab database.
       */
      findAll: async (param) => {
        try {
          r = await Reply.find(param).sort({ updatedAt: -1 }).populate([
            { path: 'createdBy', select: Models.data.comRepCreatedBy },
            { path: 'createdFor' }
          ]);
        }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no reply found!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description posts an update with required parameters.
       * @param param 
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time };
        Object.assign(param, ext);
        try { r = await Reply.create(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create reply!' } }; }
        return { message: { type: 'success' }, data: r };
      },
    },

    chat: {
      /**
       * @description finds one chat only with matching parameter.
       */
      findOne: async (param) => {
        let p;
        try {
          p = await Chat.findOne(param).populate([
            { path: 'users', select: Models.data.comRepCreatedBy },
            { path: 'admin', select: Models.data.comRepCreatedBy }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!p) { return { error: { type: 'error', text: 'chat doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: p };
      },

      /**
       * @description finds limited of the available chats in the Mlab database.
       */
      findLimited: async (query, option) => {
        let r;
        try {
          r = await Chat.find(query).sort({ updatedAt: option.sort }).skip(option.skip).limit(option.limit).populate([
            { path: 'users', select: Models.data.comRepCreatedBy },
            { path: 'admin', select: Models.data.comRepCreatedBy }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available chats in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try {
          r = await Chat.find(param).sort({ updatedAt: -1 }).populate([
            { path: 'users', select: Models.data.comRepCreatedBy },
            { path: 'admin', select: Models.data.comRepCreatedBy }
          ]);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
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
        try { r = await Message.find(query).sort({ createdAt: option.sort }).skip(option.skip).limit(option.limit).populate([
            { path: 'createdBy', select: Models.data.comRepCreatedBy }
          ]);
        }
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

    gmail: {
      /**
       * @description sends email from configured gmail account.
       */
      send: async (param) => {
        let Gmail = nodemailer.createTransport(env_g);
        let r, option = {
          from: env_g.auth.user,
          to: param.user,
          subject: param.subject,
          html: param.html
        };
        try {
          r = await Gmail.sendMail(option);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      }

    },

    template: {

      create: async (params, query) => {
        const file = path.join(__dirname, '../', 'templates', params.template + '.ejs');
        let r;
        try {
          r = await ejs.renderFile(file, query, {});
        } catch (e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      }
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