'use strict';
const Logger = require('../lib/logger');

module.exports = {
  register: Logger,
  options:  {
    name: 'core-api'
  }
};