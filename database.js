// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./strings.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS strings (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)");
});

module.exports = db;
