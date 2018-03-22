'use strict';
const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Users = require('../handlers/users');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/users`;

// GET /users
routes.push({
  method: 'GET',
  path: API_BASE_PATH,
  config: {
    auth: 'jwt',
    handler: Users.listUsers,
    description: 'List all users',
    notes: 'Lists all users the currently logged user is allowed to see',
    plugins: {
      'policy': {
        resource: 'users',
        name: 'list'
      },
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.UserListing
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