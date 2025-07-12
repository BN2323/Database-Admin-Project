const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role_name: { type: DataTypes.STRING, unique: true }
}, {
  tableName: 'Roles',
  timestamps: false
});

module.exports = Role;
