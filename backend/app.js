const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const initDatabase = require("./db/init.js");

// ========================
// MIDDLEWARES (ORDEN CORRECTO)
// ========================
app.use(cors());
app.use(express.json()); // 👈 IMPORTANTE (para req.body)

// ========================
// FRONTEND
// ========================
const frontendPath = path.resolve(__dirname, "../frontend");

// servir archivos estáticos
app.use(express.static(frontendPath));

// ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

let db;

// ========================
// START SERVER + DB
// ========================
async function start() {
  db = await initDatabase({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  // ========================
  // ROUTES API
  // ========================

  // CREATE TASK
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

  // GET TASKS
  app.get("/tasks", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks");
    res.json(rows);
  });

  // UPDATE TASK
  app.put("/tasks/:id", async (req, res) => {
    const completed = req.body?.completed;

    await db.query(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      [completed, req.params.id]
    );

    res.sendStatus(200);
  });

  // DELETE TASK
  app.delete("/tasks/:id", async (req, res) => {
    await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.sendStatus(200);
  });

  // ========================
  // SERVER
  // ========================
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server corriendo en puerto 3000");
  });
}

start();