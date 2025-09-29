// backend/index.js
// CRITICAL: Load dotenv FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

// Debug: Verify environment variables are loaded
console.log("🔍 Environment Check:");
console.log("🔑 PORT:", process.env.PORT ? "✅ Loaded" : "❌ Missing");
console.log("🔑 MONGODB_URL:", process.env.MONGODB_URL ? "✅ Loaded" : "❌ Missing");
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? `✅ Loaded (${process.env.RAZORPAY_KEY_ID})` : "❌ Missing");
console.log("🔑 Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("");

// Now import everything else
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import http from "http";
import { Server } from "socket.io";

import userRouter from "./routes/userroutes.js";
import authRouter from "./routes/authroutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://kitchen-kitchen.onrender.com", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.get("/", (_req, res) => res.json({ message: "Country Kitchen Backend API" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// SMTP test route (remove after verification)
app.get("/api/test/mail", async (_req, res) => {
  try {
    const { sendOtpMail } = await import("./utils/mail.js");
    await sendOtpMail(process.env.EMAIL, "Render SMTP Test", "Hello from Render");
    res.json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, code: e?.code, msg: e?.message, resp: e?.response });
  }
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://kitchen-kitchen.onrender.com", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_order", ({ orderId }) => {
    if (orderId) socket.join(`order_${orderId}`);
  });

  socket.on("driver_location", ({ orderId, lat, lng }) => {
    if (!orderId) return;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    io.to(`order_${orderId}`).emit("order:location", { lat, lng, ts: Date.now() });
  });

  socket.on("driver-location", (data) => {
    const { orderId, lat, lng } = data || {};
    if (!orderId) return;
    if (typeof lat !== "number" || typeof lng !== "number") return;
    io.to(`order_${orderId}`).emit("order:location", { lat, lng, ts: Date.now() });
  });
});

const startServer = async () => {
  try {
    await connectDb();
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

startServer();

export { io };
