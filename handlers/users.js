'use strict';
const Formatters = require('../lib/formatters');

function errorHandler(reply, e) {
  return this.helpers.errorHandler.apply(this, arguments);
}

exports.listUsers = async function({ query, auth }, reply) {
  try {
    const { userOrganizationRoleId, super: superUser } = auth.credentials;
    let users;
    if (superUser) {
      users = await this.models.User.listUsers(query);
    } else {
      users = await this.models.UserOrganizationRole.getUsersInSameOrganization(userOrganizationRoleId, query);
    }

    return reply(Formatters.users(users)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};