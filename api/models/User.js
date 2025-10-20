import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255) },
    username: { type: DataTypes.STRING(255) },
    email: { type: DataTypes.STRING(255) },
    password: { type: DataTypes.STRING(255) },
    profilePic: { type: DataTypes.TEXT },
    coverPic: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING(255) },
    website: { type: DataTypes.STRING(255) },
    createdAt: { type: DataTypes.DATE },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

export default User;
