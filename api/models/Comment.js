import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';
import Post from './Post.js';

class Comment extends Model {}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    desc: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    postid: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: false,
  }
);

Comment.belongsTo(User, { foreignKey: 'userid', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userid', as: 'comments' });

Comment.belongsTo(Post, { foreignKey: 'postid', as: 'post' });
Post.hasMany(Comment, { foreignKey: 'postid', as: 'comments' });

export default Comment;
