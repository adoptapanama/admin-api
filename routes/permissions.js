'use strict';
const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Permissions = require('../handlers/permissions');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/permissions`;

// GET /permissions
routes.push({
  method: 'GET',
  path: API_BASE_PATH,
  config: {
    auth: 'jwt',
    handler: Permissions.listPermissions,
    description: 'List all user permissions',
    notes: 'List all permissions a user has in the system',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.PermissionListing
          },
          '401': {
            description: 'Unauthorized',
            schema: SCHEMAS.Errors.AuthenticationError
          },
          '403': {
            description: 'Forbidden',
            schema: SCHEMAS.Errors.ForbiddenError
          },
          '500': {
            description: 'Internal Server Error',
            schema: SCHEMAS.Errors.InternalServerError
          }
        }
      }
    },
    tags: ['api'],
    validate: {
      headers: SCHEMAS.AuthorizationToken,
      query: SCHEMAS.Query
    }
  }
});

module.exports = routes;