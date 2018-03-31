'use strict';
const Boom = require('boom');
const config = require('../config/server');

const FORBIDDEN = Boom.forbidden('You are not allowed to use this resource.');

async function applyPolicies(request, reply) {
  // If route is swagger, move on
  if (request.route.realm.plugin === 'hapi-swagger') {
    return reply.continue();
  }

  const settings = request.route.settings;

  // If no credentials set and route has auth set, deny
  if (!request.auth.credentials && settings.auth) {
    return reply(FORBIDDEN);
  }

  // If no policy is set, continue
  if (!settings.plugins.policy) {
    return reply.continue();
  }

  // If user is super just skip policy check
  if (request.auth.credentials && request.auth.credentials.super) {
    return reply.continue();
  }

  if (settings.plugins.policy.super && !request.auth.credentials.super) {
    return reply(FORBIDDEN);
  }

  // Verify if user has permission
  const device = request.headers.device;
  const { userId, sessionHash, organizationId } = request.auth.credentials;
  const { resource, name } = settings.plugins.policy;

  const hasPermission = await this.redis.has(`permissions:${device}:${userId}`, this.helpers.md5(`${sessionHash}${resource}:${name}${config.sessionSalt}${(organizationId) ? organizationId : ''}`));

  if (hasPermission) {
    return reply.continue();
  }

  // Anything else means denied
  return reply(FORBIDDEN);
}

function forbidden() {
  return this(FORBIDDEN);
}

const Policies = {
  register: function(server, options, next) {
    server.logger.info('Registering policies...');

    server.ext('onPreHandler', applyPolicies.bind(server));
    server.decorate('reply', 'forbidden', forbidden);

    server.logger.info('Policies registered!');
    return next();
  }
};

Policies.register.attributes = {
  name: 'Policies',
  version: '1.0.0'
};

module.exports = Policies;