// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import http from "http";
import { Server } from "socket.io";

// Import routers
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Basic health check
app.get("/", (req, res) => {
  res.json({ message: "Country Kitchen Backend API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount routers
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter); // Added auth routes
app.use("/api/shop", shopRouter);   // /api/shop/create-edit, /api/shop/my
app.use("/api/item", itemRouter);   // /api/item/add-item
app.use("/api/order", orderRouter);

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Example: listen to driver location updates
  socket.on("driver-location", (data) => {
    console.log("Driver location:", data);
    // You can broadcast to specific users here
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
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
export{io}
