const path    = require('path');
const fs      = require('fs');
const rfs     = require('rotating-file-stream');

const log = {

  dir: path.join(__dirname, 'access.log'),

  /**
   * Morgan's Console Module Requirements
   * @description :: 
   * @property ::
   * interval -> rotate daily,
   * size -> rotate every 10 MegaBytes written,
   * compress -> compress rotated files
   */
  getStream: () => {
    console.log('directory ', log.dir);
    fs.access(log.dir, function(err) {
      if(err && err.code === 'ENOENT') {
        fs.mkdir(log.dir);
      }
    });

    let stream = rfs('access.log', {
      interval: '1d',
      size:     '10M',
      compress: 'gzip',
      path:     log.dir
    })

    return stream;
  }
};

module.exports = log.getStream;