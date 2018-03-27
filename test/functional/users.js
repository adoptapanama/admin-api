'use strict';
require('../testHelpers');
const _ = require('lodash');

exports.lab = Lab.script();

const server = Server.server;
let User;

describe('User resources', () => {
  let Permission;
  let superUser, userWithMultipleRoles, userWithNoRoles, userWithOneRole;
  let role;

  before(async () => {
    await Server.initialize();
    const setup = await createTestSetup();
    ({ User, Permission } = server.models);
    [userWithOneRole, superUser, userWithMultipleRoles, userWithNoRoles] = setup.users;
    role = setup.role;
  });

  after(() => {
    return resetTestSetup();
  });

  describe('GET /users', () => {
    let noRoleToken, regularToken, superToken;

    before(async () => {
      const permission = await Permission.getPermission('users', 'list');
      await role.setPermissions([permission]);

      [superToken, regularToken, noRoleToken] = await Promise.all([
        logIn(superUser),
        logIn(userWithOneRole),
        logIn(userWithNoRoles)
      ]);
    });

    function callServer(query, token, test) {
      return runTest({
        method: 'GET',
        url: (typeof query === 'string') ? `/users?${query}` : '/users',
        headers: {
          'Authorization': token,
          'Device': 'client'
        }
      }, test);
    }

    it('should return all users to a super user', () => {
      return callServer(false, superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(_.orderBy(result, 'name')).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }]);
      });
    });

    it('should allow a super user to sort by name ascending', () => {
      return callServer('sort=name&order=asc', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }]);
      });
    });

    it('should allow a super user to sort by name descending', () => {
      return callServer('sort=name&order=desc', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }, {
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }]);
      });
    });

    it('should allow a super user to sort by email ascending', () => {
      return callServer('sort=email&order=asc', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }]);
      });
    });

    it('should allow a super user to sort by email descending', () => {
      return callServer('sort=email&order=desc', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }, {
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }]);
      });
    });

    it('should allow a super user to search by name', () => {
      return callServer('q=super', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }]);
      });
    });

    it('should allow a super user to search by email', () => {
      return callServer('q=super', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: superUser.id,
          name: 'Super User',
          email: 'super@user.com'
        }]);
      });
    });

    it('should allow a user to paginate the results', () => {
      return callServer('sort=email&order=desc&count=2&cursor=1', superToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: userWithNoRoles.id,
          name: 'No Role',
          email: 'norole@user.com'
        }]);
      });
    });

    it('should return the users of his organization if the user is logged in with a role that has users:list permission', () => {
      return callServer(false, regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(_.orderBy(result, 'name')).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }]);
      });
    });

    it('should allow sorting by name ascending users of his organization', () => {
      return callServer('sort=name&order=asc', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }]);
      });
    });

    it('should allow sorting by name descending users of his organization', () => {
      return callServer('sort=name&order=desc', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }]);
      });
    });

    it('should allow sorting by email ascending users of his organization', () => {
      return callServer('sort=email&order=asc', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }, {
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }]);
      });
    });

    it('should allow sorting by email descending users of his organization', () => {
      return callServer('sort=email&order=desc', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }, {
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }]);
      });
    });

    it('should allow searching users of his organization by name', () => {
      return callServer('q=one', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }]);
      });
    });

    it('should allow searching users of his organization by email', () => {
      return callServer('q=multiplerole@user.com', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithMultipleRoles.id,
          name: 'Multiple Roles',
          email: 'multiplerole@user.com'
        }]);
      });
    });

    it('should allow the user to paginate the users in his organization', () => {
      return callServer('sort=name&order=asc&count=1&cursor=1', regularToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(200);
        expect(result).to.equal([{
          id: userWithOneRole.id,
          name: 'One Role',
          email: 'onerole@user.com'
        }]);
      });
    });

    it('should return a 403 if the user does not have the users:list permission', () => {
      return callServer(false, noRoleToken, ({ statusCode, result }) => {
        expect(statusCode).to.equal(403);
        expect(result).to.equal({
          error: 'Forbidden',
          message: 'You are not allowed to use this resource.',
          statusCode: 403
        });
      });
    });

    it('should return a 401 if the session is not valid', async () => {
      await server.helpers.closeSession(userWithNoRoles.id, 'client');
      return callServer(false, noRoleToken, ({ statusCode, result }) => {
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
      sinon.stub(User, 'listUsers').returns(Promise.reject('some error'));
      return callServer(false, superToken, ({ statusCode, result }) => {
        User.listUsers.restore();
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