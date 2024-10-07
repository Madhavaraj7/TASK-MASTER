import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
connectDB();

const app = express();
const FRONTEND_ENV = process.env.FRONTEND_ENV || "http://localhost:5173";


// Set up Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ENV.replace(/\/$/, ""),
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(
  cors({
    origin: FRONTEND_ENV.replace(/\/$/, ""),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

export { io };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
