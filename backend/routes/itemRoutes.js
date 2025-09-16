// backend/index.js - Final working version
import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Import routers with the fixed versions
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Debug middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mount routers with the fixed route definitions
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Country Kitchen Backend API" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 Socket client connected:", socket.id);

  socket.on("driver-location", ({ driverId, lat, lon }) => {
    io.emit("driver-location-update", { driverId, lat, lon });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket client disconnected:", socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDb();
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
      console.log(`✅ Database connected successfully`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };