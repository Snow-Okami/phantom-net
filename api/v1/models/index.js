
const mongoose = require('mongoose');
const fs = require('fs');
const _ = require('lodash');
const bycript   = require('../helpers/bcrypt');
const cloudinary = require('cloudinary');
const env_c = require('../../../environment/').cloudinary;
const env_m = require('../../../environment/').Mlab;

var Id, Admin, Post;

const Models = {
  connect: async () => {
    let mongoUrl = `mongodb://${env_m.username}:${env_m.password}@${env_m.host}:${env_m.port}/${env_m.database}`;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    mongoose.set('useCreateIndex', true);
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      Models.create.id();
      Models.create.admin();
      Models.create.post();
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
        admin: { type: String, required: true, default: '0' },
        user: { type: String, required: true, default: '0' },
        post: { type: String, required: true, default: '0' },
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

    admin: async () => {
      let schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true }, 
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
        avatar: { type: String, default: 'admin.jpg' }
      });
      Admin = mongoose.model('Admin', schema);
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

  },

  bycript: bycript,

  _: _,

  objects: {

    admin: {
      /**
       * @description finds one user only with matching parameter.
       */
      findOne: async (param) => {
        let r;
        try { r = await Admin.findOne(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'email doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description finds all the available user in the Mlab database.
       */
      findAll: async (param) => {
        let r;
        try { r = await Admin.find(param); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r.length) { return { error: { type: 'error', text: 'no admin found!' } }; }
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
          r = await Admin.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create admin!' } }; }
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes only one user matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        let r;
        try { r = await Admin.deleteOne(param); }
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
          r = await Admin.updateOne(query, param, option);
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

    }
  }
};

module.exports = Models;