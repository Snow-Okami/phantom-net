const file = {
  filter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JSON files are allowed!'), false);
    }
    cb(null, true);
  },

  getName: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-avatar-' + Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'), file.originalname.length)
    );
  }
};

module.exports = file;