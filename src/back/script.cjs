const express = require("express");
const fs = require("node:fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const charactersPath = path.join(__dirname, "characters.json");

const readCharacters = async () => {
    const data = await fs.promises.readFile(charactersPath, "utf8");
    return JSON.parse(data);
};

const writeCharacters = async (data) => {
    await fs.promises.writeFile(charactersPath, JSON.stringify(data, null, 2));
};

app.get("/api/characters", async (req, res) => {
    try {
        const data = await readCharacters();
        res.json(data.characters);
    } catch (err) {
        res.status(500).json({ error: "Failed to load characters" });
    }
});

app.get("/api/characters/search", async (req, res) => {
    try {
        const { query } = req.query;
        const data = await readCharacters();
        const results = data.characters.filter(character =>
            character.name.toLowerCase().includes(query.toLowerCase()) ||
            character.realName.toLowerCase().includes(query.toLowerCase())
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.post("/api/characters", async (req, res) => {
    try {
        const data = await readCharacters();
        const newCharacter = {
            id: Math.max(...data.characters.map(c => c.id)) + 1,
            ...req.body
        };
        data.characters.push(newCharacter);
        await writeCharacters(data);
        res.status(201).json(newCharacter);
    } catch (err) {
        res.status(500).json({ error: "Failed to add character" });
    }
});

app.put("/api/characters/:id", async (req, res) => {
    try {
        const data = await readCharacters();
        const index = data.characters.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: "Character not found" });
        data.characters[index] = { ...data.characters[index], ...req.body };
        await writeCharacters(data);
        res.json(data.characters[index]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update character" });
    }
});

app.delete("/api/characters/:id", async (req, res) => {
    try {
        const data = await readCharacters();
        const index = data.characters.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: "Character not found" });
        data.characters.splice(index, 1);
        await writeCharacters(data);
        res.json({ message: "Character deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete character" });
    }
});

app.listen(8080, () => console.log("API running on port 8080"));