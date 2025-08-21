import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET, JWT_ENC_KEY } from "../config.js";

const algorithm = "aes-256-gcm";

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(JWT_ENC_KEY, "hex"), iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return iv.toString("hex") + ":" + tag + ":" + encrypted;
}

function decryptToken(encrypted) {
  const [ivHex, tagHex, encryptedData] = encrypted.split(":");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(JWT_ENC_KEY, "hex"), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function issueToken(user) {
  const payload = { id: user._id, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return encryptToken(token);
}

export function verifyToken(encrypted) {
  const decrypted = decryptToken(encrypted);
  return jwt.verify(decrypted, JWT_SECRET);
}
