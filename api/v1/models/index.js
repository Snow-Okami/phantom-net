
const mongoose = require('mongoose');
const fs = require('fs');
const env = require('../../../environment/');

var User;

const Models = {
  connect: async () => {
    let mongoUrl = `mongodb://${env.Mlab.host}:${env.Mlab.port}/${env.Mlab.database}`;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    mongoose.set('useCreateIndex', true);
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      // console.log(`MongoDB is available at mongodb://${env.Mlab.host}:${env.Mlab.port}/${env.Mlab.database}`);
      Models.create.user();
    });
  },

  create: {
    user: async () => {
      let schema = new mongoose.Schema({
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
    }
  },

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
       * @param param looks like {name: String, username: String, email: String, password: String}.
       */
      create: async (param) => {
        let r, time = new Date().getTime(), ext = { createdAt: time, jwtValidatedAt: time };
        Object.assign(param, ext);
        try {
          // if(param.password) { param.password = await bycript.hash(param.password); }
          r = await User.create(param);
        } catch(e) { return { error: { type: 'error', text: e.message } }; }
        if(!r) { return { error: { type: 'error', text: 'can\'t create user!' } }; }
        // Object.assign(r, { 'password': '' });
        return { message: { type: 'success' }, data: r };
      },

      /**
       * @description deletes only one user matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        let r;
        try { r = await User.deleteOne(param); }
        catch(e) {  return { error: { type: 'error', text: e.message } }; }
        if(!r.n) { return { error: { type: 'error', text: 'user doesn\'t exists!' } }; }
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
            // param.password = await bycript.hash(param.password);
          }
          r = await User.updateOne(query, param, option);
        } catch(e) { { return { error: { type: 'error', text: e.message } }; } }
        if(!r.n) { return { error: { type: 'error', text: 'user doesn\'t exists!' } }; }
        return { message: { type: 'success' }, data: r };
      }
    },

    db: {
      /**
       * @description creates one user with required parameters.
       * @param param looks like {name: String, username: String, email: String, password: String}.
       */
      create: async (param) => {
        
      },

      /**
       * @description deletes only one user matching the parameters from Mlab database.
       */
      deleteOne: async (param) => {
        
      },

      /**
       * @description Read the files present in a directory.
       */
      readDir: async (param) => {
        let r;
        try { r = await fs.readdir(param.path); }
        catch(e) { return { error: { type: 'error', text: e.message } }; }
        return { message: { type: 'success' }, data: r };
      }
    }
  }
};

module.exports = Models;