'use strict';
require('../testHelpers');

exports.lab = Lab.script();

const server = Server.server;

let Specie;

describe('Species resources', () => {

  before(async () => {
    await Server.initialize();
    ({ Specie } = server.models);
  });

  describe('Initial values', () => {
    let species;
    before(async () => {
      species = await Specie.listSpecies();
    });

    it('should have a Perro species', (done) => {
      expect(species[1].name).to.equal('Perro');
      return done();
    });

    it('should have a Gato species', (done) => {
      expect(species[0].name).to.equal('Gato');
      return done();
    });
  });

  describe('GET /species', () => {
    function callServer(test) {
      return runTest({
        method: 'GET',
        url: '/species',
        headers: {
          'Device': 'client'
        }
      }, test);
    }

    it('should return a list of species', () => {
      return callServer(({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: result[0].id,
          name: 'Gato',
          description: 'Felino'
        }, {
          id: result[1].id,
          name: 'Perro',
          description: 'Canino'
        }]);
      });
    });

    it('should return a 500 if an unknown error occurs', () => {
      sinon.stub(Specie, 'listSpecies').returns(Promise.reject('some error'));
      return callServer(({ statusCode, result }) => {
        expect(statusCode).to.equal(500);
        expect(result).to.equal({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        });
        Specie.listSpecies.restore();
      });
    });
  });
});