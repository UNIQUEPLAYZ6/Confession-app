const API = "";

/* ---------------- LOAD CONFESSIONS ---------------- */
async function loadConfessions() {
    try {
        const res = await fetch("/confessions");
        const data = await res.json();

        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach(item => {
            const reactions = item.reactions || {
                like: 0,
                laugh: 0,
                sad: 0
            };

            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <p>${item.text}</p>

                <div class="reactions">
                    <button onclick="react(${item.id}, 'like', this)">
                        ❤️ <span>${reactions.like}</span>
                    </button>

                    <button onclick="react(${item.id}, 'laugh', this)">
                        😂 <span>${reactions.laugh}</span>
                    </button>

                    <button onclick="react(${item.id}, 'sad', this)">
                        😢 <span>${reactions.sad}</span>
                    </button>
                </div>
            `;

            list.appendChild(card);
        });

    } catch (err) {
        console.error("Load failed:", err);
    }
}

/* ---------------- POST CONFESSION ---------------- */
async function postConfession() {
    const input = document.getElementById("confession");
    const text = input.value.trim();

    if (!text) {
        alert("Write something first!");
        return;
    }

    try {
        const res = await fetch("/confessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (!res.ok) throw new Error("Post failed");

        input.value = "";
        loadConfessions();

    } catch (err) {
        console.error("Post error:", err);
    }
}

/* ---------------- REACTION SYSTEM ---------------- */
async function react(id, type, btn) {
    try {
        // pop animation
        btn.classList.add("pop");
        setTimeout(() => btn.classList.remove("pop"), 200);

        const res = await fetch(`/react/${id}/${type}`, {
            method: "POST"
        });

        if (!res.ok) throw new Error("Reaction failed");

        loadConfessions();

    } catch (err) {
        console.error("Reaction error:", err);
    }
}

/* ---------------- INIT ---------------- */
loadConfessions();