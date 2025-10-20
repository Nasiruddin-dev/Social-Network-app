import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// Get all groups that user is a member of
export const getGroups = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT g.*, 
        (SELECT COUNT(*) FROM group_members WHERE groupid = g.id) as memberCount,
        (SELECT COUNT(*) FROM group_members WHERE groupid = g.id AND userid = ?) as isMember
      FROM \`groups\` g
      LEFT JOIN group_members gm ON g.id = gm.groupid
      WHERE gm.userid = ? OR g.creatorid = ?
      GROUP BY g.id
      ORDER BY g.createdAt DESC
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      return res.status(200).json(data);
    });
  });
};

// Create a new group
export const createGroup = (req, res) => {
  console.log("Create group request received:", req.body);
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("No token found");
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(403).json("Token is not valid!");
    }

    console.log("Creating group for user:", userInfo.id);
    const q = "INSERT INTO `groups`(`name`, `description`, `creatorid`, `createdAt`) VALUES (?)";
    const values = [
      req.body.name,
      req.body.description || null,
      userInfo.id,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    console.log("Executing query with values:", values);
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      }

      const groupId = data.insertId;
      console.log("Group created with ID:", groupId);
      
      // Add creator as member
      const memberQ = "INSERT INTO group_members(`groupid`, `userid`, `joinedAt`) VALUES (?, ?, ?)";
      db.query(memberQ, [groupId, userInfo.id, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")], (err) => {
        if (err) {
          console.log("Error adding creator as member:", err);
          return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
        }
        console.log("Group creation successful");
        return res.status(200).json("Group has been created.");
      });
    });
  });
};

// Get group messages
export const getGroupMessages = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT gm.*, u.name, u.profilePic 
      FROM group_messages gm
      JOIN users u ON gm.userid = u.id
      WHERE gm.groupid = ?
      ORDER BY gm.createdAt ASC
    `;

    db.query(q, [req.params.groupId], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      return res.status(200).json(data);
    });
  });
};

// Send group message
export const sendGroupMessage = (req, res) => {
  console.log("Send group message request:", req.params.groupId, req.body);
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("No token found for group message");
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.log("Token verification failed for group message:", err);
      return res.status(403).json("Token is not valid!");
    }

    const q = "INSERT INTO group_messages(`groupid`, `userid`, `message`, `createdAt`) VALUES (?)";
    const values = [
      req.params.groupId,
      userInfo.id,
      req.body.message,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    console.log("Inserting group message with values:", values);
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log("Error inserting group message:", err);
        return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      }
      console.log("Group message sent successfully");
      return res.status(200).json("Message sent.");
    });
  });
};

// Get group members
export const getGroupMembers = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const groupId = req.params.groupId;

    // Ensure requester is a member or creator
    const authQ = "SELECT creatorid FROM `groups` WHERE id = ?";
    db.query(authQ, [groupId], (err, rows) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      if (rows.length === 0) return res.status(404).json("Group not found");

      const isCreator = rows[0].creatorid === userInfo.id;
      if (!isCreator) {
        const memberQ = "SELECT 1 FROM group_members WHERE groupid = ? AND userid = ?";
        db.query(memberQ, [groupId, userInfo.id], (err, memRows) => {
          if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
          if (memRows.length === 0) return res.status(403).json("Not authorized");
          // proceed to fetch members
          const q = `
            SELECT u.id, u.name, u.username, u.profilePic, gm.joinedAt
            FROM group_members gm
            JOIN users u ON gm.userid = u.id
            WHERE gm.groupid = ?
            ORDER BY gm.joinedAt ASC
          `;
          db.query(q, [groupId], (err, data) => {
            if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
            return res.status(200).json(data);
          });
        });
      } else {
        // creator can view
        const q = `
          SELECT u.id, u.name, u.username, u.profilePic, gm.joinedAt
          FROM group_members gm
          JOIN users u ON gm.userid = u.id
          WHERE gm.groupid = ?
          ORDER BY gm.joinedAt ASC
        `;
        db.query(q, [groupId], (err, data) => {
          if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
          return res.status(200).json(data);
        });
      }
    });
  });
};

// Add a member to group (creator only)
export const addGroupMember = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const groupId = req.params.groupId;
    const userIdToAdd = req.body.userId;

    if (!userIdToAdd) return res.status(400).json("userId is required");

    const authQ = "SELECT creatorid FROM `groups` WHERE id = ?";
    db.query(authQ, [groupId], (err, rows) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      if (rows.length === 0) return res.status(404).json("Group not found");
      if (rows[0].creatorid !== userInfo.id)
        return res.status(403).json("Only the group creator can add members");

      const insertQ = "INSERT INTO group_members(`groupid`, `userid`, `joinedAt`) VALUES (?, ?, ?)";
      db.query(
        insertQ,
        [groupId, userIdToAdd, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")],
        (err) => {
          if (err) {
            // Handle duplicate membership gracefully
            if (err.code === "ER_DUP_ENTRY" || err.code === "ER_DUP_KEY") {
              return res.status(200).json("User is already a member.");
            }
            return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
          }
          return res.status(201).json("Member added");
        }
      );
    });
  });
};
