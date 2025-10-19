import express from "express";
import { getGroups, createGroup, getGroupMessages, sendGroupMessage, getGroupMembers, addGroupMember } from "../controllers/group.js";

const router = express.Router();

router.get("/", getGroups);
router.post("/", createGroup);
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/messages", sendGroupMessage);
router.get("/:groupId/members", getGroupMembers);
router.post("/:groupId/members", addGroupMember);

export default router;
