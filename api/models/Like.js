import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';
import Post from './Post.js';

class Like extends Model {}

Like.init(
  {
    userid: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    postid: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['userid', 'postid'] },
    ],
  }
);

Like.belongsTo(User, { foreignKey: 'userid', as: 'user' });
User.hasMany(Like, { foreignKey: 'userid', as: 'likes' });

Like.belongsTo(Post, { foreignKey: 'postid', as: 'post' });
Post.hasMany(Like, { foreignKey: 'postid', as: 'likes' });

export default Like;
