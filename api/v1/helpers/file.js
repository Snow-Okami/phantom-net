const file = {
  filter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },

  getName: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-psynapsus-' + Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'), file.originalname.length)
    );
  }
};

module.exports = file;