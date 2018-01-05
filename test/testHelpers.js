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

async function createTestSetup() {
  const { Permission, User, Organization, Role } = server.server.models;

  const [firstOrganization, secondOrganization] = await Promise.all([
    Organization.createOrganization('First Organization', 'First'),
    Organization.createOrganization('Second Organization', 'Second')
  ]);

  // Create role
  const role = await Role.createRole('Test Role', 'Test role');
  const permission = await Permission.getPermission('users', 'list');
  await role.setPermissions([permission]);

  const [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = await Promise.all([
    User.createUser({
      name: 'One Role',
      email: 'onerole@user.com',
      password: 'testtest'
    }),
    User.createUser({
      name: 'Super User',
      email: 'super@user.com',
      password: 'testtest',
      super: true
    }),
    User.createUser({
      name: 'Multiple Roles',
      email: 'multiplerole@user.com',
      password: 'testtest'
    }),
    User.createUser({
      name: 'No Role',
      email: 'norole@user.com',
      password: 'testtest'
    })
  ]);

  // Start setting roles
  await Promise.all([
    userWithOneRole.addRole(role, firstOrganization),
    userWithMultipleRoles.addRole(role, firstOrganization),
    userWithMultipleRoles.addRole(role, secondOrganization)
  ]);

  return {
    users: [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles],
    role,
    organizations: [firstOrganization, secondOrganization]
  };
}

async function resetTestSetup() {
  const { User, Organization, Role } = server.server.models;

  const [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = await Promise.all([
    User.getUserByEmail('onerole@user.com'),
    User.getUserByEmail('super@user.com'),
    User.getUserByEmail('multiplerole@user.com'),
    User.getUserByEmail('norole@user.com')
  ]);

  const role = await Role.getByName('Test Role');
  const [firstOrganization, secondOrganization] = await Promise.all([
    Organization.getOrganizationByName('First Organization'),
    Organization.getOrganizationByName('Second Organization')
  ]);

  // Remove roles from users
  await Promise.all([
    userWithOneRole.removeRole(role, firstOrganization),
    userWithMultipleRoles.removeRole(role, firstOrganization),
    userWithMultipleRoles.removeRole(role, secondOrganization)
  ]);

  // Destroy organizations, roles, and users
  await Promise.all([
    role.destroy(),
    firstOrganization.destroy(),
    secondOrganization.destroy(),
    userWithOneRole.destroy(),
    userWithMultipleRoles.destroy(),
    superUser.destroy(),
    userWithNoRoles.destroy()
  ]);
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
  logIn,
  createTestSetup,
  resetTestSetup
});