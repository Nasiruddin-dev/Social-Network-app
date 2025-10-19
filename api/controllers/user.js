import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import cloudinary from "../cloudinary.js";

export const getUser = (req, res) => {
  const userid = req.params.userid;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userid], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      // Debug log incoming data
      console.log('Update request body:', req.body);
      console.log('User ID:', userInfo.id);

      let profilePicUrl = req.body.profilePic;
      let coverPicUrl = req.body.coverPic;

      // Upload profile pic to Cloudinary if it's base64 (starts with data:image)
      if (req.body.profilePic && req.body.profilePic.startsWith('data:image')) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
          folder: "profile_pics",
        });
        profilePicUrl = uploadResponse.secure_url;
      }

      // Upload cover pic to Cloudinary if it's base64 (starts with data:image)
      if (req.body.coverPic && req.body.coverPic.startsWith('data:image')) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.coverPic, {
          folder: "cover_pics",
        });
        coverPicUrl = uploadResponse.secure_url;
      }

      const q =
        "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

      db.query(
        q,
        [
          req.body.name,
          req.body.city,
          req.body.website,
          profilePicUrl,
          coverPicUrl,
          userInfo.id,
        ],
        (err, data) => {
          if (err) {
            console.log('SQL error:', err);
            return res.status(500).json(err);
          }
          if (data && data.affectedRows > 0) return res.json("Updated!");
          return res.status(403).json("You can update only your post!");
        }
      );
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json("Image upload failed");
    }
  });
};

export const searchUsers = (req, res) => {
  const searchQuery = req.query.q;
  
  console.log("Search request received for:", searchQuery);
  
  // If no search query, return all users (for discover mode)
  if (!searchQuery || searchQuery.trim() === "") {
    const q = "SELECT id, name, username, profilePic FROM users LIMIT 50";
    db.query(q, [], (err, data) => {
      if (err) {
        console.error("Users query error:", err);
        return res.status(500).json(err);
      }
      console.log("All users count:", data.length);
      return res.json(data);
    });
    return;
  }

  const q = "SELECT id, name, username, profilePic FROM users WHERE name LIKE ? OR username LIKE ? LIMIT 20";
  const searchTerm = `%${searchQuery}%`;

  console.log("Executing query with term:", searchTerm);

  db.query(q, [searchTerm, searchTerm], (err, data) => {
    if (err) {
      console.error("Search query error:", err);
      return res.status(500).json(err);
    }
    console.log("Search results count:", data.length);
    return res.json(data);
  });
};
