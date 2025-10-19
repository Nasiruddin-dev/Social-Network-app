import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getNotifications = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `SELECT n.*, u.name, u.profilePic, u.username
               FROM notifications n
               JOIN users u ON u.id = n.senderid
               WHERE n.receiverid = ?
               ORDER BY n.createdAt DESC
               LIMIT 50`;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const markAsRead = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE notifications SET isRead = 1 WHERE id = ? AND receiverid = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Notification marked as read");
    });
  });
};

export const createNotification = (senderid, receiverid, type, content) => {
  const q = "INSERT INTO notifications (`senderid`, `receiverid`, `type`, `content`) VALUES (?, ?, ?, ?)";
  
  db.query(q, [senderid, receiverid, type, content], (err, data) => {
    if (err) console.error("Notification creation error:", err);
  });
};
