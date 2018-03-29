'use strict';
const { addIndex, removeIndex } = require('../lib/helpers').fn;

module.exports = {
  up: async function(action, Sequelize, db) {
    const users = action.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(256),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      salt: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      super: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    const permissions = action.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      resource: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    const roles = action.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(256),
        allowNull: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    const organizations = action.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false
      },

      description: {
        type: Sequelize.STRING(256),
        allowNull: true
      },

      twitter: {
        type: Sequelize.STRING(256),
        allowNull: true
      },

      facebook: {
        type: Sequelize.STRING(256),
        allowNull: true
      },

      instagram: {
        type: Sequelize.STRING(256),
        allowNull: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    const rolePermissions = action.createTable('role_permissions', {
      roleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      permissionId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    const userOrganizationRoles = action.createTable('user_organization_roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await Promise.all([
      users,
      permissions,
      roles,
      organizations,
      rolePermissions,
      userOrganizationRoles
    ]);

    return Promise.all([
      db.query(addIndex('role_permissions', 'roleId')),
      db.query(addIndex('role_permissions', 'permissionId')),
      db.query(addIndex('organizations', 'name')),
      db.query(addIndex('user_organization_roles', 'userId')),
      db.query(addIndex('user_organization_roles', 'organizationId'))
    ]);
  },

  down: async function(action, Sequelize, db) {
    await Promise.all([
      db.query(removeIndex('role_permissions', 'roleId')),
      db.query(removeIndex('role_permissions', 'permissionId')),
      db.query(removeIndex('organizations', 'name')),
      db.query(removeIndex('user_organization_roles', 'userId')),
      db.query(removeIndex('user_organization_roles', 'organizationId'))
    ]);

    return Promise.all([
      action.dropTable('users'),
      action.dropTable('permissions'),
      action.dropTable('roles'),
      action.dropTable('organizations'),
      action.dropTable('role_permissions'),
      action.dropTable('user_organization_roles')
    ]);
  }
};