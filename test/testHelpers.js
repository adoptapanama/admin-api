'use strict';
// Bootstrap test components into global scope
const sinon = require('sinon');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const server = require('../lib/server');
const config = require('../config/server');
const jwt = require('jsonwebtoken');

process.on('rejectionHandled', () => { });


function invalidToken() {
  return 'Bearer ' + jwt.sign(
    {
      iss: 'Adopta Panama',
      iat: moment().unix(),
      exp: moment().add(config.jwtExpiresInDays, 'day').unix(),
      aud: 'adoptapanama.com',
      sub: 'any id',
      jti: 'invalid'
    },
    config.jwtSessionKey,
    { algorithm: 'HS256' }
  );
}

function createToken(options = {}) {
  return 'Bearer ' + jwt.sign({
    iss: 'Adopta Panama',
    iat: moment().unix(),
    exp: moment().add(config.jwtExpiresInDays, 'day').unix(),
    aud: 'adoptapanama.com',
    sub: options.sub || 'admin',
    jti: 'any user',
    role: options.role || 'admin'
  }, config.jwtSessionKey, { algorithm: 'HS256' });
}

function runTest(request, test) {
  return new Promise((resolve, reject) => {
    return server.server.inject(request, async function() {
      try {
        await test.apply(this, arguments);
        return resolve();
      } catch (e) {
        return reject(e);
      }
    });
  });
}

function logIn(user) {
  return new Promise((resolve, reject) => {
    runTest.call(server.server, {
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: user.email,
        password: 'testtest'
      },
      headers: {
        'Device': 'client'
      }
    }, ({ statusCode, result }) => {
      if (statusCode > 202) {
        return reject(result);
      }
      return resolve(`Bearer ${result['access_token']}`);
    });
  });
}

Object.assign(global, {
  expect: Code.expect,
  describe: lab.describe,
  it: lab.it,
  before: lab.before,
  beforeEach: lab.beforeEach,
  after: lab.after,
  afterEach: lab.afterEach,
  sinon: sinon,
  Server: server,
  Lab: Lab,
  invalidToken,
  createToken,
  runTest,
  logIn
});