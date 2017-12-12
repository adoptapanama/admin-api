'use strict';
const Redis = require('../lib/redis');

module.exports = {
  register: Redis,
  options: {
    host: process.env.REDIS_HOST || 'redis',
    password: process.env.REDIS_PASSWORD
  }
};