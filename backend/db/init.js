const mysql = require("mysql2/promise");

async function initDatabase(config) {
  // 1. Conexión inicial SIN base de datos
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port
  });

  // 2. Crear base de datos si no existe
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`
  );

  // 3. Usar la base de datos
  await connection.query(`USE \`${config.database}\`;`);

  // 4. Crear tabla
  await connection.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Cerrar conexión inicial
  await connection.end();

  // 6. Conexión FINAL con la base de datos ya creada
  const db = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port
  });

  return db;
}

module.exports = initDatabase;