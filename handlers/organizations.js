'use strict';

const Formatters = require('../lib/formatters');

function errorHandler(reply, e) {
  return this.helpers.errorHandler.apply(this, arguments);
}

// GET /organizations
exports.listOrganizations = async function({ auth, query}, reply) {
  try {
    const organizations = await this.models.Organization.listOrganizations();
    return reply(Formatters.organizations(organizations)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};