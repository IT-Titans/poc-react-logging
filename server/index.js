// server/index.js
import { fileURLToPath } from "url";
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, "./logs.json");

// The demo credentials come from .env (see .env.example), the same file Vite
// reads for the browser side.
const LOGGER_USERNAME = process.env.VITE_LOGGER_USERNAME;
const LOGGER_PASSWORD = process.env.VITE_LOGGER_PASSWORD;

if (!LOGGER_USERNAME || !LOGGER_PASSWORD) {
  console.error(
    "VITE_LOGGER_USERNAME and VITE_LOGGER_PASSWORD are not set. Copy .env.example to .env first."
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    console.log("No auth header");
    res.set("WWW-Authenticate", 'Basic realm="401"');
    return res.status(401).send("Authentication required.");
  }
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");
  if (username === LOGGER_USERNAME && password === LOGGER_PASSWORD) {
    console.log("Authenticated");
    return next();
  }
  console.log("Invalid credentials");
  res.set("WWW-Authenticate", 'Basic realm="401"');
  return res.status(401).send("Access denied");
};

app.post("/api/logs", auth, (req, res) => {
  const logEntry = req.body;
  console.log("Log-Eintrag:", logEntry);
  fs.appendFile(LOG_FILE, JSON.stringify(logEntry) + "\n", (err) => {
    if (err) {
      res.status(500).json({ message: "Fehler beim Schreiben." });
    } else {
      res.json({ message: "Log gespeichert." });
    }
  });
});

app.listen(3001, () => {
  console.log("Server läuft auf http://localhost:3001");
});
