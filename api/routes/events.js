import express from "express";
import { getEvents, createEvent, rsvpEvent } from "../controllers/event.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.post("/:eventId/rsvp", rsvpEvent);

export default router;
