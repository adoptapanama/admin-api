'use strict';
const Hapi = require('hapi');
const config = require('../config/server');

const server = new Hapi.Server({
  debug: false
});

server.connection({
  port: process.env.PORT || config.defaultPort,
  routes: {
    payload: {
      maxBytes: config.maxUploadBytes
    },
    cors: {
      origin: ['*'],
      additionalHeaders: ['Content-Type', 'Accept-Language', 'Accept-Encoding']
    }
  }
});

// Load application plugins
const plugins = [
  require('inert'),
  require('vision'),
  require('../config/logs'),
  require('../config/swagger'),
  require('../config/database'), // Need to load db first to have it available in the decorator
  require('../config/associations'),
  require('../config/redis'),
  require('./helpers'),
  require('../config/authentication'),
  require('../config/routes')
];

function register() {
  return server.register(plugins);
}


function initialize() {
  if (server.models) {
    return Promise.resolve();
  }
  return register()
    .then(server.initialize.bind(server));
};

async function start() {
  await register();
  return server.start.call(server);
}

const apiPrefix = config.apiPrefix;

if (apiPrefix && process.env.NODE_ENV === 'test') {
  const baseInject = server.inject;

  server.inject = function(options, callback) {
    const newOptions = Object.assign({}, options, {
      url: apiPrefix + options.url
    });

    return baseInject.call(server, newOptions, callback);
  };
}

// Handle async unhandledRejection
process.on('unhandledRejection', () => { });

module.exports = {
  info: server.info,
  initialize,
  register,
  start,
  server
};