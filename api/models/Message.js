import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Message extends Model {}

Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderid: { type: DataTypes.INTEGER, allowNull: false },
    receiverid: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false,
    indexes: [
      { fields: ['createdAt'] },
    ],
  }
);

Message.belongsTo(User, { foreignKey: 'senderid', as: 'sender' });
User.hasMany(Message, { foreignKey: 'senderid', as: 'sentMessages' });

Message.belongsTo(User, { foreignKey: 'receiverid', as: 'receiver' });
User.hasMany(Message, { foreignKey: 'receiverid', as: 'receivedMessages' });

export default Message;
