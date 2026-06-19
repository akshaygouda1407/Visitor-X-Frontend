import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/visitors", (req, res) => {
  const dbPath = path.join(__dirname, "db.json");

  if (!fs.existsSync(dbPath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  res.json(data.visitors || []);
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log('VisitorX App live on port ${port}');
});