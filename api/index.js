import express from "express";
const app = express();
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import storiesRoutes from "./routes/stories.js";
import notificationRoutes from "./routes/notifications.js";
import groupRoutes from "./routes/groups.js";
import eventRoutes from "./routes/events.js";
import messageRoutes from "./routes/messages.js";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./connect.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(
  cors({
    origin: "https://social-network-app.vercel.app",
  })
);
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use("/upload", express.static(path.join(__dirname, "../client/public/upload")));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Lightweight health check for app and DB connectivity
app.get("/api/health", (req, res) => {
  db.query("SELECT 1 AS ok", (err, rows) => {
    if (err) {
      return res.status(500).json({ status: "degraded", db: "down", error: String(err.code || err.message) });
    }
    res.json({ status: "ok", db: "up", result: rows && rows[0] && rows[0].ok === 1 ? 1 : 0 });
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messageRoutes);

app.listen(8800, () => {
  console.log("API working!");
});
