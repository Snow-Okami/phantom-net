const file = {
  filter: function(req, file, cb) {
    if (!file.originalname.match(/\.(json)$/)) {
      return cb(new Error('Only JSON files are allowed!'), false);
    }
    cb(null, true);
  },

  getName: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.json');
  }
};

module.exports = file;