require('dotenv').config();
const mongoose = require('mongoose');
var User, Post;

const models = {
  connect: async function() {
    let mongoUrl = 'mongodb://' + process.env.hostname + ':' + process.env.port + '/' + process.env.db;
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('MongoDB is available at mongodb://' + process.env.hostname + ':' + process.env.port + '/' + process.env.db);
      models.create.user();
      models.create.post();
    });
  },

  create: {
    user: async function() {
      let schema = new mongoose.Schema({
        name: { type: String }
      });
      User = mongoose.model('User', schema);
    },

    post: async function() {
      let schema = new mongoose.Schema({
        name: { type: String }
      });
      Post = mongoose.model('Post', schema);

      const post = await Post.create({ name: 'Feeling Luckey' });
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
      const r = await Post.find({ name: 'Feeling Luckey' });
      return r;
    },
    create: async function(param) {
      const r = await Post.create({ name: 'Feeling Luckey' });
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