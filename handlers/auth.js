'use strict';
const Boom = require('boom');
const config = require('../config/server');
const Errors = require('../lib/errors');
const Formatters = require('../lib/formatters');

function errorHandler(reply, e) {
  if (e instanceof Errors.InvalidEmailPasswordError || e instanceof Errors.InvalidRoleError) {
    return reply(Errors.SystemCodes[e.code]);
  }

  if (e instanceof Errors.BadRequestError) {
    return reply(Boom.badRequest(e.message));
  }

  return this.helpers.errorHandler.apply(this, arguments);
}

async function createSession(user, permissions, organizationId, device, userOrganizationRoleId) {
  const session = this.helpers.createRandomBytes(64);
  const sessionHash = this.helpers.md5(`${config.sessionSalt}${session}`);

  const jwt = this.helpers.createJWTToken({
    userId: user.id,
    organizationId,
    super: user.isSuper(),
    hash: sessionHash,
    roleId: userOrganizationRoleId
  });

  await Promise.all([this.redis.remove(`session:${device}:${user.id}`), this.redis.remove(`permissions:${device}:${user.id}`)]);
  const expirationInSeconds = config.jwtExpirationDays * 60 * 60 * 24;

  await this.redis.set(`session:${device}:${user.id}`, this.helpers.md5(`${sessionHash}${config.sessionSalt}`));
  await this.redis.expire(`session:${device}:${user.id}`, expirationInSeconds);

  if (permissions) {
    const hashedPermissions = permissions.map((permission) => this.helpers.md5(`${sessionHash}${permission}${config.sessionSalt}${(organizationId) ? organizationId : ''}`));
    await this.redis.addToSet(`permissions:${device}:${user.id}`, hashedPermissions);
    await this.redis.expire(`permissions:${device}:${user.id}`, expirationInSeconds);
  }

  return jwt;
}

// POST /auth/login
exports.login = async function({ headers, payload }, reply) {
  try {
    if (!headers.device) {
      throw new Errors.BadRequestError('No device sent in headers.');
    }

    // TODO: Need to sort out why Joi header validation is not working correctly
    if (!['client', 'mobile'].includes(headers.device)) {
      throw new Errors.BadRequestError('Invalid device sent in headers.');
    }

    const { email, password } = payload;
    const user = await this.models.User.getUserByEmail(email);
    if (!user) {
      throw new Errors.InvalidEmailPasswordError();
    }

    // Validate password
    if (!user.isPasswordValid(password)) {
      throw new Errors.InvalidEmailPasswordError();
    }

    if (user.isSuper()) {
      const jwt = await createSession.call(this, user, ['super'], null, headers.device);
      return reply(Formatters.jwt(jwt)).code(200);
    }

    // Get user roles
    await user.getRoles();

    if (user.roles.length === 1) {
      // If user only has one role, immediately log him in that role
      let permissions = await user.roles[0].getPermissions();
      permissions = permissions.map(({ resource, name }) => `${resource}:${name}`);
      const jwt = await createSession.call(this, user, permissions, user.roles[0].organization.id, headers.device, user.roles[0].userOrganizationRoleId);
      return reply(Formatters.jwt(jwt)).code(200);
    }

    const jwt = await createSession.call(this, user, null, null, headers.device);
    return reply(Formatters.jwt(jwt)).code(202);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};

// GET /auth/roles
exports.getRoles = async function({ auth }, reply) {
  try {
    // Get user first
    const user = await this.models.User.getUser(auth.credentials.userId);

    // Get user roles
    await user.getRoles();

    return reply(Formatters.organizationRoles(user.roles)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};

// GET /auth/roles/{id}
exports.changeRole = async function({ auth, params, headers }, reply) {
  try {
    const userOrganizationRoleId = params.userOrganizationRoleId;
    const { userId } = auth.credentials;

    const userOrganizationRole = await this.models.UserOrganizationRole.getRecord(userOrganizationRoleId);

    if (!userOrganizationRole || userOrganizationRole.user.id !== userId) {
      this.helpers.closeSession(userId, headers.device);
      throw new Errors.InvalidRoleError();
    }

    // Start a new session
    const permissions = userOrganizationRole.role.permissions.map(({ resource, name }) => `${resource}:${name}`);
    const jwt = await createSession.call(this, userOrganizationRole.user, permissions, userOrganizationRole.organizationId, headers.device, userOrganizationRole.id);
    return reply(Formatters.jwt(jwt)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};