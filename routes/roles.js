'use strict';
const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Roles = require('../handlers/roles');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/roles`;

// GET /admin/roles
routes.push({
  method: 'GET',
  path: API_BASE_PATH,
  config: {
    auth: 'jwt',
    handler: Roles.listRoles,
    description: 'List all user roles',
    notes: 'Lists all available user roles in the system',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.RoleListing
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