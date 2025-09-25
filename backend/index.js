// backend/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import http from "http";
import { Server } from "socket.io";

// Routers
import userRouter from "./routes/userroutes.js";
import authRouter from "./routes/authroutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Core middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // same as current setup
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // includes PATCH for owner/delivery routes
  })
);

// Health checks
app.get("/", (req, res) => {
  res.json({ message: "Country Kitchen Backend API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount routers (unchanged)
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://kitchen-kitchen.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

// Socket rooms per order for live tracking
io.on("connection", (socket) => {
  // Client: socket.emit('join_order', { orderId })
  socket.on("join_order", ({ orderId }) => {
    if (orderId) socket.join(`order_${orderId}`);
  });

  // Client (delivery): socket.emit('driver_location', { orderId, lat, lng })
  socket.on("driver_location", ({ orderId, lat, lng }) => {
    if (!orderId) return;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    // Broadcast to everyone tracking this order (user, owner, delivery if needed)
    io.to(`order_${orderId}`).emit("order:location", { lat, lng, ts: Date.now() });
  });

  // Backward-compat event name if needed (no-op if unused on client)
  socket.on("driver-location", (data) => {
    const { orderId, lat, lng } = data || {};
    if (!orderId) return;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    io.to(`order_${orderId}`).emit("order:location", { lat, lng, ts: Date.now() });
  });
});

// Start server with DB connect
const startServer = async () => {
  try {
    await connectDb();
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

startServer();

// Optional export if other modules need access to io
export { io };
