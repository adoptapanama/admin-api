'use strict';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = function(db) {
  const UserOrganizationRole = db.define('UserOrganizationRole', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    organizationId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    roleId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false
    }
  }, {
    tableName: 'user_organization_roles'
  });

  // Instance Methods

  // Static Methods
  UserOrganizationRole.createRecord = function(user, role, organization) {
    return this.create({
      userId: user.id,
      roleId: role.id,
      organizationId: organization.id
    });
  };

  UserOrganizationRole.getUserRoles = async function(user) {
    const organizationRoles = await this.findAll({
      attributes: ['id'],
      where: {userId: user.id},
      order: [[{model: this.sequelize.models.Organization, as: 'organization'}, 'name', 'ASC']],
      include: [{
        model: this.sequelize.models.Role,
        as: 'role'
      }, {
        model: this.sequelize.models.Organization,
        as: 'organization'
      }]
    });

    return organizationRoles.map(({ id, role, organization }) => {
      role.id = id;
      role.userOrganizationRoleId = id;
      role.organization = organization;
      return role;
    });
  };

  UserOrganizationRole.getRecord = function(id) {
    return this.findOne({
      where: { id },
      include: [{
        model: this.sequelize.models.Role,
        as: 'role',
        include: [{
          model: this.sequelize.models.Permission,
          as: 'permissions',
          order: [['resource', 'ASC'], ['name', 'ASC']]
        }]
      }, {
        model: this.sequelize.models.User,
        as: 'user',
        attributes: ['id']
      }]
    });
  };

  UserOrganizationRole.listPermissionsForRole = async function(id) {
    const record = await this.getRecord(id);
    return record.role.permissions;
  };

  UserOrganizationRole.removeRoleFromUser = function(userId, roleId, organizationId) {
    return this.destroy({
      where: { userId, roleId, organizationId }
    });
  };

  UserOrganizationRole.getUsersInSameOrganization = async function(id, options = {}) {
    const userOrganizationRole = await this.findOne({
      where: { id },
      attributes: ['organizationId']
    });

    if (!userOrganizationRole) {
      throw new Errors.UserOrganizationRoleNotFoundError();
    }

    const userModel = {
      model: this.sequelize.models.User,
      as: 'user'
    };

    // Query
    if (options.q) {
      userModel.where = {
        [Op.or]: {
          name: {
            [Op.like]: `%${options.q}%`
          },
          email: {
            [Op.like]: `%${options.q}%`
          }
        }
      };
    }

    const query = {
      where: {
        organizationId: userOrganizationRole.organizationId
      },
      include: [userModel]
    };

    // Sorting
    switch (options.sort) {
      case 'name':
        query.order = [[userModel, 'name', options.order || 'asc']];
        break;
      case 'email':
        query.order = [[userModel, 'email', options.order || 'asc']];
        break;
    }

    // Pagination
    if (options.count !== undefined) {
      query.limit = options.count;
    }

    if (options.cursor !== undefined) {
      query.offset = options.cursor;
    }

    // Find all users
    const users = await UserOrganizationRole.findAll(query);

    return users.map(({ user }) => user);
  };

  return UserOrganizationRole;
};

module.exports.register = function({ UserOrganizationRole, User, Organization, Role }) {
  UserOrganizationRole.belongsTo(User, {as: 'user', foreignKey: 'userId'});
  UserOrganizationRole.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});
  UserOrganizationRole.belongsTo(Organization, {as: 'organization', foreignKey: 'organizationId'});
};