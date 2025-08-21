import { verifyToken } from "../utils/jwt.js";

export function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) throw new Error("No token");

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);

      req.user = decoded;
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
