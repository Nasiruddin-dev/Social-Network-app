import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Event extends Model {}

Event.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING(255) },
    eventDate: { type: DataTypes.DATE, allowNull: false },
    creatorid: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: false,
  }
);

Event.belongsTo(User, { foreignKey: 'creatorid', as: 'creator' });
User.hasMany(Event, { foreignKey: 'creatorid', as: 'createdEvents' });

export default Event;
