const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const initDatabase = require("./db/init.js");

app.use(cors());
app.use(express.json()); // 👈 IMPORTANTE (para req.body)

const frontendPath = path.resolve(__dirname, "../frontend");

// servir archivos estáticos
app.use(express.static(frontendPath));

// ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

let db;

async function start() {
  db = await initDatabase({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  app.post("/tasks", async (req, res) => {
    const title = req.body?.title; // 👈 seguro contra undefined

    if (!title) {
      return res.status(400).json({ error: "title requerido" });
    }

    const [result] = await db.query(
      "INSERT INTO tasks (title) VALUES (?)",
      [title]
    );

    res.json({
      id: result.insertId,
      title,
      completed: false
    });
  });

  app.get("/tasks", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks");
    res.json(rows);
  });

  app.put("/tasks/:id", async (req, res) => {
    const completed = req.body?.completed;

    await db.query(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      [completed, req.params.id]
    );

    res.sendStatus(200);
  });

  app.delete("/tasks/:id", async (req, res) => {
    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.sendStatus(200);
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log("Server corriendo en puerto 3000");
  });
}

start();