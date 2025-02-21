import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { lookupABN } from "./modules/abn-tool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../webgui/zms-wisr/dist")));

app.post("/api/lookup-abn", async (req, res) => {
  const { abn } = req.body;
  if (!abn) {
    return res.status(400).json({ error: "ABN is required in JSON body." });
  }
  try {
    const result = await lookupABN(abn);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../webgui/zms-wisr/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
