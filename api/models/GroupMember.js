import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import Group from './Group.js';
import User from './User.js';

class GroupMember extends Model {}

GroupMember.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupid: { type: DataTypes.INTEGER, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    joinedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'GroupMember',
    tableName: 'group_members',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['groupid', 'userid'] },
    ],
  }
);

GroupMember.belongsTo(Group, { foreignKey: 'groupid', as: 'group' });
Group.hasMany(GroupMember, { foreignKey: 'groupid', as: 'members' });

GroupMember.belongsTo(User, { foreignKey: 'userid', as: 'user' });
User.hasMany(GroupMember, { foreignKey: 'userid', as: 'groupMemberships' });

export default GroupMember;
