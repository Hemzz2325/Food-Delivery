// backend/index.js

// Core modules
import http from "http";

// Third-party modules
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";

// Local modules
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);

// Handle preflight requests
app.options('*', cors());

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ Correct routes using relative paths
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Health check
app.get("/health", (req, res) => {
  console.log("✅ Health check requested");
  res.json({ 
    ok: true, 
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    port: port
  });
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
app.use('/*', (req, res) => {
  console.warn("❌ 404 - Route not found:", req.method, req.originalUrl);
  res.status(404).json({ 
    message: "Route not found",
    method: req.method,
    url: req.originalUrl,
    availableEndpoints: ["/health", "/api/auth", "/api/user", "/api/shop", "/api/item", "/api/order"]
  });
});

// Create HTTP server for Socket.IO
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

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 Socket client connected:", socket.id);

  // Driver sends location
  socket.on("driver-location", ({ driverId, lat, lon }) => {
    console.log(`📍 Driver ${driverId} location update:`, { lat, lon });
    io.emit("driver-location-update", { driverId, lat, lon });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket client disconnected:", socket.id);
  });
});

// Connect DB and start server
const startServer = async () => {
  try {
    console.log(`🚀 Server starting on port ${port}...`);
    await connectDb();
    
    server.listen(port, () => {
      console.log(`Server successfully started at http://localhost:${port}`);
      console.log(` Health check: http://localhost:${port}/health`);
      console.log(` Auth endpoint: http://localhost:${port}/api/auth/signin`);
      console.log(` Available routes:`);
      console.log(`   GET  /health`);
      console.log(`   POST /api/auth/signin`);
      console.log(`   POST /api/auth/signup`);
      console.log(`   GET  /api/user/current`);
      console.log(`   GET  /api/shop/get-myShop`);
      console.log(`   GET  /api/item/get-by-city/:city`);
      console.log(`   POST /api/order/create`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };
