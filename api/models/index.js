require('dotenv').config();
const mongoose = require('mongoose');
var Admin, User, Post;

const models = {
  connect: async function() {
    let mongoUrl = 'mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('MongoDB is available at mongodb://' + process.env.dbhostname + ':' + process.env.dbport + '/' + process.env.db);
      models.create.admin();
      models.create.user();
      models.create.post();
    });
  },

  create: {
    admin: async function() {
      let schema = new mongoose.Schema({
        fname: { type: String },
        lname: { type: String },
        email: { type: String, required: true },
        createdAt: { type: Date },
        jwtValidatedAt: { type: Date },
      });
      Admin = mongoose.model('Admin', schema);
    },

    user: async function() {
      let schema = new mongoose.Schema({
        fname: { type: String },
        lname: { type: String },
        username: { type: String },
        email: { type: String, required: true },
        password: { type: String },
        createdAt: { type: Date },
        jwtValidatedAt: { type: Date },
        emailValidated: { type: Boolean, required: true },
      });
      User = mongoose.model('User', schema);
    },

    post: async function() {
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

  user: {
    find: async function(param) {
      const r = await User.find({ name: 'Abhisek Dutta' });
      return r;
    },
    create: async function(param) {
      const r = await User.create(param);
      return r;
    },
    update: async function(param) {
      const r = await User.updateOne({ name: 'Abhisek Dutta' });
      return r;
    },
    delete: async function(params) {
      const r = await User.deleteOne(params);
      return r;
    }
  },

  post: {
    find: async function(param) {
      const r = await Post.find();
      return r;
    },
    create: async function(req) {
      const r = await Post.create(Object.assign(req.body, { 'filename': req.file.filename }));
      return r;
    },
    update: async function(param) {
      const r = await Post.updateOne({ name: 'Feeling Luckey' });
      return r;
    },
    delete: async function() {
      const r = await Post.deleteOne({ name: 'Feeling Luckey' });
      return r;
    }
  }

};

module.exports = models;