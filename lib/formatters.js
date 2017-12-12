'use strict';
const config = require('../config/server');
const moment = require('moment');

function jwt(jwt) {
  return {
    'access_token': jwt.replace(/^Bearer\s/, ''),
    'token_type': 'Bearer',
    'expires_in': moment().add(config.jwtExpirationDays, 'days').unix()
  };
}

function organizationRoles(roles) {
  return roles.map(({ name, organization, userOrganizationRoleId }) => {
    return {
      id: userOrganizationRoleId,
      name,
      organization: organization.name
    };
  });
}

module.exports = {
  jwt,
  organizationRoles
};