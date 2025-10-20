import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Relationship extends Model {}

Relationship.init(
  {
    followerUserid: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    followedUserid: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  },
  {
    sequelize,
    modelName: 'Relationship',
    tableName: 'relationships',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['followerUserid', 'followedUserid'] },
    ],
  }
);

Relationship.belongsTo(User, { foreignKey: 'followerUserid', as: 'follower' });
Relationship.belongsTo(User, { foreignKey: 'followedUserid', as: 'followed' });

User.hasMany(Relationship, { foreignKey: 'followerUserid', as: 'following' });
User.hasMany(Relationship, { foreignKey: 'followedUserid', as: 'followers' });

export default Relationship;
