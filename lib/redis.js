'use strict';
const redis = require('redis');
let client;

function set(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(value);
    });
  });
}

function get(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

function expire(key, seconds) {
  return new Promise((resolve, reject) => {
    return client.expire(key, seconds, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

function addToSet(key, value) {
  return new Promise((resolve, reject) => {
    return client.sadd(key, value, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(value);
    });
  });
}

function getSet(key) {
  return new Promise((resolve, reject) => {
    return client.smembers(key, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

function has(key, value) {
  return new Promise((resolve, reject) => {
    return client.sismember(key, value, (err, response) => {
      if (err)  {
        return reject(err);
      }
      return resolve(!!response);
    });
  });
}

function remove(key) {
  return new Promise((resolve, reject) => {
    return client.del(key, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

const Redis = {
  register: function(server, options, next) {
    server.logger.info('Registering Redis services...');

    if (!options.host) {
      throw Error('Cannot start caching server. Missing configuration');
    }

    const redisOptions = {
      password: options.password,
      host: options.host
    };

    client = redis.createClient(redisOptions);

    client.on('connect', () => {
      server.logger.info('Redis services registered!');

      server.decorate('server', 'redis', {
        set,
        get,
        expire,
        addToSet,
        getSet,
        has,
        remove
      });
      return next();
    });
  }
};

Redis.register.attributes = {
  name: 'Redis',
  version: '1.0.0'
};

module.exports = Redis;