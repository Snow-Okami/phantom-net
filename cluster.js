const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  // Count the machine's CPUs
  var cpuCount = os.cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i ++) {
    cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', function () {
    cluster.fork();
  });
} else {
  require('./app.js');
}
