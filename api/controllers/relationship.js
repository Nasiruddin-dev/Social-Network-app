import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import { createNotification } from "./notification.js";

export const getRelationships = (req,res)=>{
    const q = "SELECT followerUserid FROM relationships WHERE followedUserid = ?";

    db.query(q, [req.query.followedUserid], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(relationship=>relationship.followerUserid));
    });
}

export const getFollowers = (req, res) => {
  const userid = req.query.userid;
  const q = `SELECT u.id, u.name, u.username, u.profilePic
             FROM relationships r
             JOIN users u ON u.id = r.followerUserid
             WHERE r.followedUserid = ?`;
  db.query(q, [userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getFollowing = (req, res) => {
  const userid = req.query.userid;
  const q = `SELECT u.id, u.name, u.username, u.profilePic
             FROM relationships r
             JOIN users u ON u.id = r.followedUserid
             WHERE r.followerUserid = ?`;
  db.query(q, [userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");


    const q = "INSERT INTO relationships (`followerUserid`,`followedUserid`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.userid
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      
      // Create notification for the followed user
      createNotification(userInfo.id, req.body.userid, 'follow', 'started following you');
      
      return res.status(200).json("Following");
    });
  });
};

export const deleteRelationship = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM relationships WHERE `followerUserid` = ? AND `followedUserid` = ?";

    db.query(q, [userInfo.id, req.query.userid], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollow");
    });
  });
};