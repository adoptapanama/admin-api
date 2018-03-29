'use strict';
require('../testHelpers');

exports.lab = Lab.script();

const server = Server.server;

let Organization;

describe('Organizations resources', () => {
  let firstOrganization, secondOrganization;
  let superUser, userWithNoRoles;

  before(async () => {
    await Server.initialize();
    const setup = await createTestSetup();
    ({Organization} = server.models);
    [, superUser, , userWithNoRoles] = setup.users;
    [firstOrganization, secondOrganization] = setup.organizations;
  });

  after(() => {
    return resetTestSetup();
  });

  describe('GET /organizations', () => {
    let noRoleToken, superToken;

    before(async () => {
      [superToken, noRoleToken] = await Promise.all([
        logIn(superUser),
        logIn(userWithNoRoles)
      ]);
    });

    function callServer(token, test) {
      return runTest({
        method: 'GET',
        url: '/organizations',
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }
    it('should return all organizations to a super user', () => {
      return callServer(superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        const organizations = result.map(({id, name, description, twitter, facebook, instagram}) => {
          return {id, name, description, twitter, facebook, instagram};
        });
        expect(organizations).to.equal([{
          id: firstOrganization.id,
          name: 'First Organization',
          description: 'First',
          twitter: 'https://twitter.com/firstorganization',
          facebook: 'https://facebook.com/firstorganization',
          instagram: 'https://instagram.com/firstorganization'
        }, {
          id: secondOrganization.id,
          name: 'Second Organization',
          description: 'Second',
          twitter: 'https://twitter.com/secondorganization',
          facebook: 'https://facebook.com/secondorganization',
          instagram: 'https://instagram.com/secondorganization'
        }]);
      });
    });

    it('should return a 403 if user is not a super user', () => {
      return callServer(noRoleToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(403);
        expect(result).to.equal({
          error: 'Forbidden',
          statusCode: 403,
          message: 'You are not allowed to use this resource.'
        });
      });
    });

    it('should return a 401 if the session is not valid', async () => {
      await server.helpers.closeSession(userWithNoRoles.id, 'client');
      return callServer(noRoleToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(401);
        expect(result).to.equal({
          error: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid credentials',
          attributes: {
            error: 'Invalid credentials'
          }
        });
      });
    });


    it('should return 500 if an unknown error occurs', () => {
      sinon.stub(Organization, 'listOrganizations').returns(Promise.reject('some error'));
      return callServer(superToken, ({ statusCode, result }) => {
        Organization.listOrganizations.restore();
        expect(statusCode).to.equal(500);
        expect(result).to.equal({
          error: 'Internal Server Error',
          statusCode: 500,
          message: 'An internal server error occurred'
        });
      });
    });
  });
});