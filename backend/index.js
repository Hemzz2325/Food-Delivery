// backend/index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js"; // Make sure you have this
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

import http from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 8000;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:3000",
      "http://localhost:5000"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);
app.options('*', cors());

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debug requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ Use only relative paths for routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Country Kitchen Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      user: "/api/user",
      shop: "/api/shop",
      item: "/api/item",
      order: "/api/order"
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    url: req.originalUrl
  });
});

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ],
    credentials: true,
  },
});

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
      console.log(`✅ Server started at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };
