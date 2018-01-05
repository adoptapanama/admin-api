'use strict';
require('../testHelpers');

exports.lab = Lab.script();
const allPermissions = require('../fixtures/permissions');

const server = Server.server;
let Permission;

describe('Permission resources', () => {
  let superUser, userWithMultipleRoles, userWithNoRoles, userWithOneRole;

  before(async () => {
    await Server.initialize();
    const setup = await createTestSetup();
    ({ Permission } = server.models);
    [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = setup.users;
  });

  after(() => {
    return resetTestSetup();
  });

  describe('GET /permissions', () => {
    let multiRoleToken, noRoleToken, regularToken, superToken;

    before(async () => {
      [superToken, regularToken, multiRoleToken, noRoleToken] = await Promise.all([
        logIn(superUser),
        logIn(userWithOneRole),
        logIn(userWithMultipleRoles),
        logIn(userWithNoRoles)
      ]);
    });

    function callServer(token, test) {
      return runTest({
        method: 'GET',
        url: '/permissions',
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }
    it('should return all permissions to a super user', () => {
      return callServer(superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        const permissions = result.map(({ name, resource }) => {
          return { name, resource };
        });
        expect(permissions).to.equal(allPermissions);
      });
    });

    it('should only return the permissions a logged in user has if he/she is not a super', () => {
      return callServer(regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: result[0].id,
          resource: 'users',
          name: 'list'
        }]);
      });
    });

    it('should not return any permissions if the user has multiple roles, but havent signed in to one', () => {
      return callServer(multiRoleToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([]);
      });
    });

    it('should not return any permissions if the user has no roles', () => {
      return callServer(noRoleToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([]);
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

    it('should return a 500 if an unknown error occurs', () => {
      sinon.stub(Permission, 'listPermissions').returns(Promise.reject('some error'));
      return callServer(superToken, ({ statusCode, result }) => {
        Permission.listPermissions.restore();
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