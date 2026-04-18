const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const FILE = "confessions.json";

/* ---------------- SAFE READ ---------------- */
function getData() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, "[]");
            return [];
        }

        const data = fs.readFileSync(FILE, "utf-8");
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("READ ERROR:", err);
        return [];
    }
}

/* ---------------- SAFE WRITE ---------------- */
function saveData(data) {
    try {
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("WRITE ERROR:", err);
    }
}

/* ---------------- HOME ---------------- */
app.get("/", (req, res) => {
    res.send("Confession API Running 🚀");
});

/* ---------------- GET ALL CONFESSIONS ---------------- */
app.get("/confessions", (req, res) => {
    res.json(getData());
});

/* ---------------- ADD CONFESSION ---------------- */
app.post("/confessions", (req, res) => {
    try {
        const data = getData();

        const newConfession = {
            id: Date.now(),
            text: req.body.text || "",
            reactions: {
                like: 0,
                laugh: 0,
                cry: 0
            }
        };

        data.unshift(newConfession);
        saveData(data);

        res.json(newConfession);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save confession" });
    }
});

/* ---------------- REACTIONS ---------------- */
app.post("/react/:id/:type", (req, res) => {
    try {
        const data = getData();

        const id = Number(req.params.id);
        const type = req.params.type;

        const allowed = ["like", "laugh", "cry"];

        const updated = data.map(item => {
            if (Number(item.id) === id) {
                if (!item.reactions) {
                    item.reactions = { like: 0, laugh: 0, cry: 0 };
                }

                if (allowed.includes(type)) {
                    item.reactions[type] = (item.reactions[type] || 0) + 1;
                }
            }
            return item;
        });

        saveData(updated);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Reaction failed" });
    }
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});