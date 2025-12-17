const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'shop.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_order_id INTEGER,
        customer_name TEXT,
        customer_phone TEXT,
        customer_address TEXT,
        date TEXT,
        total REAL,
        items TEXT,
        status TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (!err) {
            // Migrations: Add new columns if they don't exist
            const columnsToAdd = [
                'user_order_id INTEGER',
                'customer_name TEXT',
                'customer_phone TEXT',
                'customer_address TEXT'
            ];

            columnsToAdd.forEach(col => {
                db.run(`ALTER TABLE orders ADD COLUMN ${col}`, (err) => {
                    // Ignore error if column already exists
                });
            });
        }
    });
});

module.exports = db;
