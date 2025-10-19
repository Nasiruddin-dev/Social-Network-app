import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import cloudinary from "../cloudinary.js";

export const getStories = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // console.log(userInfo.id);

  const q = `SELECT s.*, name FROM stories AS s JOIN users AS u ON (u.id = s.userid)
  LEFT JOIN relationships AS r ON (s.userid = r.followedUserid AND r.followerUserid = ?) LIMIT 4`;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addStory = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      // Expecting base64 image data in req.body.img
      const fileStr = req.body.img;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: "stories",
      });
      const imageUrl = uploadResponse.secure_url;

      const q = "INSERT INTO stories(`img`, `userid`) VALUES (?, ?)";
      const values = [
        imageUrl,
        userInfo.id,
      ];

      db.query(q, values, (err, data) => {
        if (err) {
          console.log("Story creation error:", err);
          return res.status(500).json(err);
        }
        return res.status(200).json("Story has been created.");
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json("Image upload failed");
    }
  });
};

export const deleteStory = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

  const q = "DELETE FROM stories WHERE `id`=? AND `userid` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Story has been deleted.");
      return res.status(403).json("You can delete only your story!");
    });
  });
};
