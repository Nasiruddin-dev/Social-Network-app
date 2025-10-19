import express from "express";
import { getConversations, getMessages, sendMessage } from "../controllers/message.js";

const router = express.Router();

router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.post("/", sendMessage);

export default router;
