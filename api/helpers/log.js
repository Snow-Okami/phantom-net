const path    = require('path');
const fs      = require('fs');
const rfs     = require('rotating-file-stream');
const dir = path.join(__dirname, '../../access.log');

fs.access(dir, (err) => {
  if(err && err.code === 'ENOENT') {
    fs.mkdirSync(dir);
  }
});

let log = rfs('access.log', {
  interval: '1d',
  size:     '10M',
  compress: 'gzip',
  path:     dir
});

module.exports = log;