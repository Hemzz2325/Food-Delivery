// middlewares/isAuth.js
import jwt from "jsonwebtoken";

export default function isAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) return res.status(401).json({ message: "Auth token missing" });

    if (typeof token !== "string" || token.trim() === "") {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Invalid auth token" });
    }

    if (token === "undefined" || token === "null") {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Invalid auth token" });
    }

    // basic JWT format check
    if ((token.match(/\./g) || []).length !== 2) {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Malformed token" });
    }

    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server misconfigured" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({
        message: "Invalid or expired token",
        error: verifyErr.message,
      });
    }

    if (!decoded?.id) return res.status(401).json({ message: "Token does not contain user id" });

    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("isAuth error:", err);
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
}
