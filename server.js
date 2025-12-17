const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// --- Auth API ---

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?,?,?)';
    db.run(sql, [username, email, password], function (err) {
        if (err) {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.json({ id: this.lastID, username, email });
    });
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const sql = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?';
    db.get(sql, [login, login, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ id: row.id, username: row.username, email: row.email });
    });
});

// --- Orders API ---

app.post('/api/orders', (req, res) => {
    const { userId, date, total, items, status, name, phone, address } = req.body;

    // 1. Get current max order ID for this user
    db.get('SELECT MAX(user_order_id) as maxId FROM orders WHERE user_id = ?', [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        const nextId = (row && row.maxId) ? row.maxId + 1 : 1;

        // 2. Insert with new user_order_id and customer info
        const sql = 'INSERT INTO orders (user_id, user_order_id, date, total, items, status, customer_name, customer_phone, customer_address) VALUES (?,?,?,?,?,?,?,?,?)';
        db.run(sql, [userId, nextId, date, total, JSON.stringify(items), status, name, phone, address], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, user_order_id: nextId, status: 'success' });
        });
    });
});

app.get('/api/orders', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC';
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const orders = rows.map(r => ({
            ...r,
            items: JSON.parse(r.items)
        }));
        res.json(orders);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
