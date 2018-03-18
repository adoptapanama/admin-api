'use strict';
const Formatters = require('../lib/formatters');

function errorHandler(reply, e) {
  return this.helpers.errorHandler.apply(this, arguments);
}

// GET /species
exports.listSpecies = async function(request, reply) {
  try {
    const species = await this.models.Specie.listSpecies();
    return reply(Formatters.species(species)).code(200);
  } catch (e) {
    return errorHandler.call(this, reply, e);
  }
};