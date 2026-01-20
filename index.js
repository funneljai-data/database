const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const API_KEY = "funisgood";

/* =========================
   STORAGE
   ========================= */
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "lastseen.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

let lastSeenData = {
    updatedAt: null,
    players: []
};

// Load saved data on boot
if (fs.existsSync(DATA_FILE)) {
    try {
        lastSeenData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {}
}

app.use(express.json());

/* =========================
   RECEIVE DATA FROM MC
   ========================= */
app.post("/api/lastseen", (req, res) => {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).send("Forbidden");
    }

    const { players } = req.body;

    if (!Array.isArray(players)) {
        return res.status(400).send("Invalid payload");
    }

    lastSeenData = {
        updatedAt: new Date().toISOString(),
        players
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(lastSeenData, null, 2));
    console.log("[INFO] Last-seen data updated");

    res.send("OK");
});

/* =========================
   WEB PAGE
   ========================= */
app.get("/", (req, res) => {
    let rows = "";

    for (const p of lastSeenData.players) {
        rows += `
            <tr>
                <td>${p.name}</td>
                <td>${p.time}</td>
            </tr>
        `;
    }

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Player Last Seen</title>
    <meta http-equiv="refresh" content="10">
    <style>
        body {
            background: #0f172a;
            color: #e5e7eb;
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        h1 {
            color: #38bdf8;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #334155;
            text-align: left;
        }
        th {
            color: #93c5fd;
        }
        .updated {
            margin-top: 10px;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>🕒 Player Last Seen (EST)</h1>

    <table>
        <tr>
            <th>Player</th>
            <th>Last Seen</th>
        </tr>
        ${rows || "<tr><td colspan='2'>No data</td></tr>"}
    </table>

    <div class="updated">
        Last updated: ${lastSeenData.updatedAt ?? "Never"}
    </div>
</body>
</html>
    `);
});

/* =========================
   START SERVER
   ========================= */
app.listen(PORT, () => {
    console.log(`✅ Web server running at http://localhost:${PORT}`);
});
