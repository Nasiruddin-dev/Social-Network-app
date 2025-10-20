import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import Event from './Event.js';
import User from './User.js';

class EventRsvp extends Model {}

EventRsvp.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventid: { type: DataTypes.INTEGER, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('going', 'interested', 'not_going'), allowNull: false, defaultValue: 'interested' },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'EventRsvp',
    tableName: 'event_rsvp',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['eventid', 'userid'] },
    ],
  }
);

EventRsvp.belongsTo(Event, { foreignKey: 'eventid', as: 'event' });
Event.hasMany(EventRsvp, { foreignKey: 'eventid', as: 'rsvps' });

EventRsvp.belongsTo(User, { foreignKey: 'userid', as: 'user' });
User.hasMany(EventRsvp, { foreignKey: 'userid', as: 'eventRsvps' });

export default EventRsvp;
