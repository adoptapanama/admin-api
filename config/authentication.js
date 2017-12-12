'use strict';
const Authentication = require('../lib/authentication');
const config = require('./server');

module.exports = {
  register: Authentication,
  options: config
};