import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class Post extends Model {}

Post.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    desc: { type: DataTypes.TEXT },
    img: { type: DataTypes.TEXT },
    place: { type: DataTypes.STRING(255), allowNull: true },
    taggedFriends: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    userid: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: false,
  }
);

Post.belongsTo(User, { foreignKey: 'userid', as: 'author' });
User.hasMany(Post, { foreignKey: 'userid', as: 'posts' });

export default Post;
