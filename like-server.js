// Simple Like Backend (Node.js/Express)
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3030;
const DATA_FILE = path.join(__dirname, 'likes.json');

app.use(cors());
app.use(express.json());

// Helper: Load likes from file
function loadLikes() {
    if (!fs.existsSync(DATA_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return {};
    }
}
// Helper: Save likes to file
function saveLikes(likes) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(likes, null, 2));
}

// Get all like counts
app.get('/likes', (req, res) => {
    res.json(loadLikes());
});

// Like a project (by id or name)
app.post('/like/:project', (req, res) => {
    const project = req.params.project;
    const likes = loadLikes();
    likes[project] = (likes[project] || 0) + 1;
    saveLikes(likes);
    res.json({ project, likes: likes[project] });
});

app.listen(PORT, () => {
    console.log(`Like server running at http://localhost:${PORT}`);
});
