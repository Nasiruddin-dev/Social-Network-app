import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import Group from './Group.js';
import User from './User.js';

class GroupMessage extends Model {}

GroupMessage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupid: { type: DataTypes.INTEGER, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'GroupMessage',
    tableName: 'group_messages',
    timestamps: false,
  }
);

GroupMessage.belongsTo(Group, { foreignKey: 'groupid', as: 'group' });
Group.hasMany(GroupMessage, { foreignKey: 'groupid', as: 'messages' });

GroupMessage.belongsTo(User, { foreignKey: 'userid', as: 'author' });
User.hasMany(GroupMessage, { foreignKey: 'userid', as: 'groupMessages' });

export default GroupMessage;
