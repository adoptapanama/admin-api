'use strict';

const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Organizations = require('../handlers/organizations');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/organizations`;

// GET /organizations
routes.push({
  method: 'GET',
  path: API_BASE_PATH,
  config: {
    auth: 'jwt',
    handler: Organizations.listOrganizations,
    description: 'List all organizations',
    notes: 'List all organizations in the system',
    plugins: {
      'policy': {
        super:true
      },
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.Organizations
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
    tags: ['api']
  }
});

module.exports = routes;