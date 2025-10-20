import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import cloudinary from "../cloudinary.js";

export const getPosts = (req, res) => {
  const userid = req.query.userid;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    console.log("userid from query:", userid);

    const q =
      userid && userid !== "undefined"
        ? `SELECT p.*, u.id AS userid, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userid) WHERE p.userid = ? ORDER BY p.createdAt DESC`
        : `SELECT p.*, u.id AS userid, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userid)
    LEFT JOIN relationships AS r ON (p.userid = r.followedUserid) WHERE r.followerUserid= ? OR p.userid =?
    ORDER BY p.createdAt DESC`;

    const values =
      userid && userid !== "undefined" ? [userid] : [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      return res.status(200).json(data);
    });
  });
};

export const addPost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      let imageUrl = "";
      
      // If there's an image, upload to Cloudinary
      if (req.body.img) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.img, {
          folder: "posts",
        });
        imageUrl = uploadResponse.secure_url;
      }

      const q =
        "INSERT INTO posts(`desc`, `img`, `place`, `taggedFriends`, `createdAt`, `userid`) VALUES (?)";
      const values = [
        req.body.desc,
        imageUrl,
        req.body.place || null,
        req.body.taggedFriends || null,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userInfo.id,
      ];

      db.query(q, [values], (err, data) => {
        if (err) {
          console.log("Post creation error:", err);
          return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
        }
        return res.status(200).json("Post has been created.");
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json("Image upload failed");
    }
  });
};
export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM posts WHERE `id`=? AND `userid` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};
