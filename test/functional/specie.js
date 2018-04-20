'use strict';

const Server = require('../../lib/server');
const server = Server.server;
const { expect } = require('code');
const { describe, before, it } = (exports.lab = require('lab').script());

let species = [];

describe('Specie migration', (done) => {
  before(async () => {
    await Server.initialize();

    const { Specie } = server.models;
    const models = await Specie.findAll({ limit: 10 });

    species = models.map((model) => model.toJSON());
  });

  it('should include at least "perro" & "gato"', (done) => {
    const names = species.map((specie) => specie.name);

    expect(names).to.include(['perro', 'gato']);
    done();
  });
});