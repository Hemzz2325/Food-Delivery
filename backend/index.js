// backend/index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Routers
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();
const port = process.env.PORT || 8000;

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ Add debug logs before mounting routers
console.log("Mounting authRouter at /api/auth");
app.use("/api/auth", authRouter);

console.log("Mounting userRouter at /api/user");
app.use("/api/user", userRouter);

console.log("Mounting shopRouter at /api/shop");
app.use("/api/shop", shopRouter);

console.log("Mounting itemRouter at /api/item");
app.use("/api/item", itemRouter);

console.log("Mounting orderRouter at /api/order");
app.use("/api/order", orderRouter);

// Health route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "Country Kitchen Backend API" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// HTTP server + Socket.io
const server = http.createServer(app);
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
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };
