// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Route to handle string submission
app.post('/submit', (req, res) => {
    const { value } = req.body;
    db.run("INSERT INTO strings (value) VALUES (?)", [value], function(err) {
        if (err) {
            return res.status(500).send("Error storing string.");
        }
        res.send("String stored successfully!");
    });
});

// Route to display all stored strings
app.get('/strings', (req, res) => {
    db.all("SELECT * FROM strings", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving strings.");
        }
        res.send(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
