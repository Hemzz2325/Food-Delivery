import jwt from "jsonwebtoken";

export default function isAuth(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) return res.status(401).json({ message: "Auth token missing" });

    if (typeof token !== "string" || token.trim() === "") {
      // clear invalid cookie if present
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Invalid auth token" });
    }

    // reject literal strings 'undefined' or 'null'
    if (token === "undefined" || token === "null") {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Invalid auth token" });
    }

    // Basic JWT format check: must contain two dots
    if ((token.match(/\./g) || []).length !== 2) {
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Malformed token" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      console.error("Token verify error:", verifyErr);
      if (req.cookies?.token) res.clearCookie("token");
      return res.status(401).json({ message: "Invalid or expired token", error: verifyErr.message });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
}
