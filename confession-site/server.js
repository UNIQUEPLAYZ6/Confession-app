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
    if (!fs.existsSync(FILE)) return [];
    const data = fs.readFileSync(FILE, "utf-8");
    return data ? JSON.parse(data) : [];
}

/* ---------------- SAFE WRITE ---------------- */
function saveData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* ---------------- GET ALL ---------------- */
app.get("/confessions", (req, res) => {
    res.json(getData());
});

/* ---------------- ADD CONFESSION ---------------- */
app.post("/confessions", (req, res) => {
    const data = getData();

    const newItem = {
        id: Date.now(),
        text: req.body.text,
        reactions: {
            like: 0,
            laugh: 0,
            sad: 0
        }
    };

    data.unshift(newItem);
    saveData(data);

    res.json(newItem);
});

/* ---------------- REACTIONS ---------------- */
app.post("/react/:id/:type", (req, res) => {
console.log("HIT:", req.params);
   
 const data = getData();

    const id = Number(req.params.id);
    const type = req.params.type;

    const allowed = ["like", "laugh", "sad"];

    data.forEach(item => {
        if (Number(item.id) === id) {
            if (!item.reactions) {
                item.reactions = { like: 0, laugh: 0, sad: 0 };
            }

            if (allowed.includes(type)) {
                item.reactions[type] += 1;
            }
        }
    });

    saveData(data);

    res.json({ success: true });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});