'use strict';
const Formatters = require('../lib/formatters');

function errorHandler(reply, e) {
  return this.helpers.errorHandler.apply(this, arguments);
}

// GET /permissions
exports.listPermissions = async function({ auth, query}, reply) {
  try {
    const { userOrganizationRoleId, super: superUser } = auth.credentials;

    // If user is not logged in to a role, return empty
    if (!userOrganizationRoleId && !superUser) {
      return reply([]).code(200);
    }

    const permissions = (superUser) ? await this.models.Permission.listPermissions() : await this.models.UserOrganizationRole.listPermissionsForRole(userOrganizationRoleId);
    return reply(Formatters.permissions(permissions)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};