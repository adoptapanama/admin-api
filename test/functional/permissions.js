'use strict';
require('../testHelpers');

let Permission, User;

let regularUser, superUser;

exports.lab = Lab.script();
const server = Server.server;

describe.skip('Permission resources', () => {

  before(async () => {
    await Server.initialize();
    ({ User, Permission } = server.models);
    [superUser, regularUser] = await Promise.all([
      User.createUser({
        name: 'Super User',
        email: 'super@user.com',
        super: true
      }),
      User.createUser({
        name: 'Regular User',
        email: 'regular@user.com'
      })
    ]);
  });

  after(() => {
    return Promise.all([
      superUser.destroy(),
      regularUser.destroy()
    ]);
  });

  describe('GET /permissions', () => {

    function callServer(token, test) {
      return runTest.call(server, {
        method: 'GET',
        url: '/categories',
        headers: {
          'Authorization': token
        }
      }, test);
    }
    it('should return all permissions to a super user', () => {
      Permission.getPermission(); // For the linter in the meantime
      return callServer(token, ({ statusCode, result }) => {

      });
    });
  });
});