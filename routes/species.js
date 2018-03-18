'use strict';
const config = require('../config/server');
const SCHEMAS = require('../lib/schemas');
const Species = require('../handlers/species');

const routes = [];
const API_BASE_PATH = `${config.apiPrefix}/species`;

// GET /species
routes.push({
  method: 'GET',
  path: API_BASE_PATH,
  config: {
    handler: Species.listSpecies,
    description: 'List all species',
    notes: 'List all species in the system',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SCHEMAS.Species
          },
          '400': {
            description: 'Bad Request',
            schema: SCHEMAS.Errors.BadRequestSpeciesError
          }
        }
      }
    },
    tags: ['api']

  }
});

module.exports = routes;