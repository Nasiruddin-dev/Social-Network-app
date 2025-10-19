import express from "express";
import { getUser, updateUser, searchUsers } from "../controllers/user.js";

const router = express.Router()

router.get("/find/:userid", getUser)
router.get("/search", searchUsers)
router.put("/", updateUser)


export default router