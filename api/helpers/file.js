const file = {
  filter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },

  getName: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.png');
  }
};

module.exports = file;