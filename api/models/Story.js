import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Story extends Model {}

Story.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    img: { type: DataTypes.TEXT, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Story',
    tableName: 'stories',
    timestamps: false,
  }
);

Story.belongsTo(User, { foreignKey: 'userid', as: 'author' });
User.hasMany(Story, { foreignKey: 'userid', as: 'stories' });

export default Story;
