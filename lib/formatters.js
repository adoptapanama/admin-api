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

function users(users) {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email
  }));
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

function permissions(permissions) {
  return permissions.map(permission);
}

function permission({ id, name, resource }) {
  return { id, name, resource };
}

function organizations(organizations) {
  return organizations.map(organization);
}

function organization({id, name, description, twitter, facebook, instagram }) {
  return {id, name, description, twitter, facebook, instagram };
}

module.exports = {
  jwt,
  users,
  organizationRoles,
  permission,
  permissions,
  organization,
  organizations
};