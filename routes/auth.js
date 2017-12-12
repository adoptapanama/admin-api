'use strict';
const Joi = require('joi');
const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Auth = require('../handlers/auth');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/auth`;

// POST /auth/login
routes.push({
  method: 'POST',
  path: `${API_BASE_PATH}/login`,
  config: {
    handler: Auth.login,
    description: 'Logs a user into the system',
    notes: 'Logs a user into the system and returns a jwt. If user has multiple roles, it will return a 202 to signal role login needs to be done.',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.Jwt
          },
          '202': {
            description: 'Accepted',
            schema: SCHEMAS.Jwt
          },
          '400': {
            description: 'Bad Request',
            schema: SCHEMAS.Errors.BadRequestLoginError
          },
          '401': {
            description: 'Unauthorized',
            schema: SCHEMAS.Errors.AuthenticationError
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
      headers: Joi.object({
        Device: Joi.string().description('Device session will be initialized for').valid('client', 'mobile').example('client').label('Device')
      }).unknown(),
      payload: SCHEMAS.LoginPayload
    }
  }
});

// GET /auth/roles
routes.push({
  method: 'GET',
  path: `${API_BASE_PATH}/roles`,
  config: {
    auth: 'jwt',
    handler: Auth.getRoles,
    description: 'List roles user has in system',
    notes: 'Lists all the roles the currently logged user has within the system',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.OrganizationRoles
          },
          '401': {
            description: 'Unauthorized',
            schema: SCHEMAS.Errors.AuthenticationError
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
      headers: SCHEMAS.AuthorizationToken
    }
  }
});

// GET /auth/roles/{userOrganizationRoleId}
routes.push({
  method: 'GET',
  path: `${API_BASE_PATH}/roles/{userOrganizationRoleId}`,
  config: {
    auth: 'jwt',
    handler: Auth.changeRole,
    description: 'Changes the role for currently logged user',
    notes: 'Changes the current role for the currently logged user and returns a new jwt',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.Jwt
          },
          '401': {
            description: 'Unauthorized',
            schema: SCHEMAS.Errors.AuthenticationError
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
      params: Joi.object({
        userOrganizationRoleId: SCHEMAS.Uuid.UserOrganizationRoleId.required()
      })
    }
  }
});

module.exports = routes;