import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// Get conversations list
export const getConversations = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT DISTINCT 
        u.id, u.name, u.profilePic,
        m.message as lastMessage,
        m.createdAt as lastMessageTime,
        (SELECT COUNT(*) FROM \`messages\` 
         WHERE senderid = u.id AND receiverid = ? AND isRead = 0) as unread
      FROM \`messages\` m
      JOIN users u ON (
        (m.senderid = u.id AND m.receiverid = ?) OR 
        (m.receiverid = u.id AND m.senderid = ?)
      )
      WHERE m.id IN (
        SELECT MAX(id) FROM \`messages\` 
        WHERE (senderid = ? AND receiverid = u.id) OR (receiverid = ? AND senderid = u.id)
        GROUP BY 
          LEAST(senderid, receiverid), 
          GREATEST(senderid, receiverid)
      )
      AND u.id != ?
      ORDER BY m.createdAt DESC
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id, userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// Get messages with a specific user
export const getMessages = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const otherUserId = req.params.userId;

    const q = `
      SELECT m.*, 
        sender.name as senderName, sender.profilePic as senderPic,
        receiver.name as receiverName, receiver.profilePic as receiverPic
        FROM \`messages\` m
      JOIN users sender ON m.senderid = sender.id
      JOIN users receiver ON m.receiverid = receiver.id
      WHERE (m.senderid = ? AND m.receiverid = ?) 
         OR (m.senderid = ? AND m.receiverid = ?)
      ORDER BY m.createdAt ASC
    `;

    db.query(q, [userInfo.id, otherUserId, otherUserId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);

      // Mark messages as read
        const updateQ = "UPDATE `messages` SET isRead = 1 WHERE senderid = ? AND receiverid = ? AND isRead = 0";
      db.query(updateQ, [otherUserId, userInfo.id], (err) => {
        if (err) console.log("Error marking messages as read:", err);
      });

      return res.status(200).json(data);
    });
  });
};

// Send message
export const sendMessage = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

      const q = "INSERT INTO `messages`(`senderid`, `receiverid`, `message`, `isRead`, `createdAt`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.receiverId,
      req.body.message,
      0,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Message sent.");
    });
  });
};
