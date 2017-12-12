'use strict';
const Sequelize = require('sequelize');

module.exports = function(db) {
  const Role = db.define('Role', {
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
    }
  }, {
    tableName: 'roles'
  });

  // Static Methods
  Role.createRole = function(name, description) {
    return this.create({ name, description });
  };

  return Role;
};

module.exports.register = function({ Role, Permission, UserOrganizationRole }) {
  Role.belongsToMany(Permission, {as: 'permissions', foreignKey: 'roleId', through: 'role_permissions'});
  Role.hasMany(UserOrganizationRole, {as: 'organizationRoles', foreignKey: 'roleId'});
};