'use strict';
const jwt = require('jsonwebtoken');
const Boom = require('boom');
const _ = require('lodash');
const crypto = require('crypto');
const moment = require('moment');
const { cryptoKey, jwtSessionKey, jwtExpirationDays } = require('../config/server');

const Helpers = {};

const CRYPTO_ALGORITHM = 'aes-256-cbc';

Helpers.errorHandler = function(reply, err) {
  this.logger.error(err.stack);
  return reply(Boom.badImplementation('An unknown error has occured. Please try again later.'));
};

Helpers.encrypt = function(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, new Buffer(cryptoKey), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('base64') + ':' + encrypted.toString('base64');
};

Helpers.decrypt = function(text) {
  const textParts = text.split(':');
  const iv = new Buffer(textParts.shift(), 'base64');
  const encryptedText = new Buffer(textParts.join(':'), 'base64');
  const decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, new Buffer(cryptoKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

Helpers.hash = function(text) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
};

Helpers.md5 = function(text) {
  const hash = crypto.createHash('md5');
  hash.update(text);
  return hash.digest('hex');
};

Helpers.createJWTToken = function(data) {
  return 'Bearer ' + jwt.sign({
    iss: 'Adopta Panamá',
    iat: moment().unix(),
    exp: moment()
      .add(jwtExpirationDays, 'days')
      .unix(),
    aud: 'adoptapanama.com',
    sub: data.userId,
    org: data.organizationId || null,
    super: data.super || false,
    jti: data.hash,
    rid: data.roleId
  },
  jwtSessionKey,
  { algorithm: 'HS256' });
};

Helpers.createCheckSum = function(obj) {
  const string = JSON.stringify(obj) + cryptoKey;
  const hash = crypto.createHash('sha256');
  hash.update(string);
  return hash.digest('hex');
};

Helpers.createRandomBytes = function(length) {
  return crypto.randomBytes(length).toString('hex');
};

Helpers.addIndex = function(table, column) {
  return 'ALTER TABLE `' + table + '` ADD INDEX `' + column + '` (`' + column + '`)';
};

Helpers.removeIndex = function(table, column) {
  return 'DROP INDEX `' + column + '` ON `' + table + '`';
};

Helpers.closeSession = function(userId, device) {
  return Promise.all([
    this.redis.remove(`session:${device}:${userId}`),
    this.redis.remove(`permissions:${device}:${userId}`)
  ]);
};

const register = function(server, options, next) {
  // Bind the server to the helper functions
  _.each(Helpers, (helper, idx) => {
    Helpers[idx] = helper.bind(server);
  });

  server.decorate('server', 'helpers', Helpers);
  next();
};

register.attributes = {
  name: 'Helpers',
  version: '1.0.0'
};

module.exports = {
  register,
  fn: Helpers
};