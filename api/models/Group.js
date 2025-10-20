import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Group extends Model {}

Group.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    creatorid: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: false,
  }
);

Group.belongsTo(User, { foreignKey: 'creatorid', as: 'creator' });
User.hasMany(Group, { foreignKey: 'creatorid', as: 'createdGroups' });

export default Group;
