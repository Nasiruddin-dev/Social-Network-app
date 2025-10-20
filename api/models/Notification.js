import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderid: { type: DataTypes.INTEGER, allowNull: false },
    receiverid: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: false,
  }
);

Notification.belongsTo(User, { foreignKey: 'senderid', as: 'sender' });
Notification.belongsTo(User, { foreignKey: 'receiverid', as: 'receiver' });

User.hasMany(Notification, { foreignKey: 'senderid', as: 'sentNotifications' });
User.hasMany(Notification, { foreignKey: 'receiverid', as: 'notifications' });

export default Notification;
