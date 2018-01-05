'use strict';
const Sequelize = require('sequelize');

module.exports = function(db) {
  const Permission = db.define('Permission', {
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
    }
  }, {
    tableName: 'permissions'
  });

  // Static Methods
  Permission.listPermissions = function() {
    return this.findAll({
      order: [['resource', 'ASC'], ['name', 'ASC']]
    });
  };

  Permission.getPermission = function(resource, name) {
    return this.findOne({
      where: { resource, name }
    });
  };

  return Permission;
};

module.exports.register = function({ Permission, Role }) {
  Permission.belongsToMany(Role, {as: 'roles', foreignKey: 'permissionId', through: 'role_permissions'});
};