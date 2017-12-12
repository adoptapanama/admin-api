'use strict';
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package.json');
const config = require('./server');

module.exports = {
  register: HapiSwagger,
  options: {
    info: {
      title: 'Adopta Panama Core API',
      description: Pack.description,
      version: Pack.version
    },
    lang: 'en',
    tags: [{name: 'api'}],
    host: config.devHost,
    sortEndpoints: 'ordered'
  }
};