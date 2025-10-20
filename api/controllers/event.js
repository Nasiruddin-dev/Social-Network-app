import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// Get all events
export const getEvents = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT e.*, u.name, u.profilePic,
        (SELECT COUNT(*) FROM event_rsvp WHERE eventid = e.id AND status = 'going') as attendees,
        (SELECT status FROM event_rsvp WHERE eventid = e.id AND userid = ?) as userRSVP
      FROM \`events\` e
      JOIN users u ON e.creatorid = u.id
      ORDER BY e.eventDate ASC
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      return res.status(200).json(data);
    });
  });
};

// Create event
export const createEvent = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO `events`(`title`, `description`, `location`, `eventDate`, `creatorid`, `createdAt`) VALUES (?)";
    const values = [
      req.body.title,
      req.body.description || null,
      req.body.location || null,
      req.body.eventDate,
      userInfo.id,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
      return res.status(200).json("Event has been created.");
    });
  });
};

// RSVP to event
export const rsvpEvent = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Check if already RSVP'd
    const checkQ = "SELECT * FROM event_rsvp WHERE eventid = ? AND userid = ?";
    db.query(checkQ, [req.params.eventId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");

      if (data.length > 0) {
        // Update existing RSVP
        const updateQ = "UPDATE event_rsvp SET status = ? WHERE eventid = ? AND userid = ?";
        db.query(updateQ, [req.body.status, req.params.eventId, userInfo.id], (err) => {
          if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
          return res.status(200).json("RSVP updated.");
        });
      } else {
        // Create new RSVP
        const insertQ = "INSERT INTO event_rsvp(`eventid`, `userid`, `status`, `createdAt`) VALUES (?)";
        const values = [
          req.params.eventId,
          userInfo.id,
          req.body.status,
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        ];
        db.query(insertQ, [values], (err) => {
          if (err) return res.status(500).json(err?.sqlMessage || err?.message || "Server error");
          return res.status(200).json("RSVP created.");
        });
      }
    });
  });
};
