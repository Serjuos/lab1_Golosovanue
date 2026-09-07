// database.js
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'poll.db');

let db;

async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS frameworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
  
  // Добавляем user_name в таблицу votes
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      framework_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (framework_id) REFERENCES frameworks(id)
    );
  `);

  const defaults = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'NestJS'];
  defaults.forEach(name => {
    db.run('INSERT OR IGNORE INTO frameworks(name) VALUES (?)', [name]);
  });

  save();
}

function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0];
}

function run(sql, params = []) {
  db.run(sql, params);
  save();
}

module.exports = {
  ready: (async () => { await init(); })(),

  getAllFrameworks: () => all('SELECT * FROM frameworks'),
  getFrameworkById: (id) => get('SELECT * FROM frameworks WHERE id = ?', [id]),
  
  // Добавляем голос с именем пользователя
  addVote: (frameworkId, userName) => 
    run('INSERT INTO votes(framework_id, user_name) VALUES (?, ?)', [frameworkId, userName]),
  
  getResults: () => all(`
    SELECT f.id, f.name, COUNT(v.id) AS votes
    FROM frameworks f
    LEFT JOIN votes v ON v.framework_id = f.id
    GROUP BY f.id
    ORDER BY votes DESC
  `),
  
  getTotalVotes: () => get('SELECT COUNT(*) AS total FROM votes').total,
  
  // Получаем все голоса с именами (для страницы результатов)
  getAllVotes: () => all(`
    SELECT v.id, v.user_name, f.name AS framework, v.voted_at
    FROM votes v
    JOIN frameworks f ON v.framework_id = f.id
    ORDER BY v.voted_at DESC
  `),
};