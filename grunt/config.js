'use strict';


var fs = require('fs');

var basePort,
    config;

basePort = 9200;

config = {
  build: '.build',
  buildPort: basePort,
  dist: 'dist',
  distPort: basePort + 1,
  liveReloadPort: basePort + 9,
  pkg: JSON.parse(fs.readFileSync('./package.json', 'utf-8')),
  src: 'src'
};


module.exports = config;
