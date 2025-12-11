const express = require("express");
const cors = require("cors");
const { Low, JSONFile } = require("lowdb");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { items: [] };
  await db.write();
}

function findItem(id) {
  return db.data.items.find((i) => i.id === id);
}

app.get("/items", async (req, res) => {
  await db.read();
  res.json(db.data.items);
});

app.get("/items/:id", async (req, res) => {
  await db.read();
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.post("/items", async (req, res) => {
  await db.read();
  const { name, description } = req.body;
  const id = Date.now().toString();
  const newItem = { id, name, description };
  db.data.items.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

app.put("/items/:id", async (req, res) => {
  await db.read();
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.name = req.body.name ?? item.name;
  item.description = req.body.description ?? item.description;
  await db.write();
  res.json(item);
});

app.delete("/items/:id", async (req, res) => {
  await db.read();
  const idx = db.data.items.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.data.items.splice(idx, 1);
  await db.write();
  res.status(204).send();
});

async function startServer() {
  await initDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

startServer();
