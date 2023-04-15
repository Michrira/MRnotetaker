// Import Dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Handling Async
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// Establishing Server
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/notes', (req, res) => {
    readFileAsync('./db/db.json', 'utf8').then((data) => {
        const notes = JSON.parse(data) || [];
        res.json(notes);
    }).catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

app.post('/api/notes', (req, res) => {
    const note = req.body;
    readFileAsync('./db/db.json', 'utf8').then((data) => {
        const notes = JSON.parse(data) || [];
        note.id = notes.length + 1;
        notes.push(note);
        return writeFileAsync('./db/db.json', JSON.stringify(notes));
    }).then(() => {
        res.json(note);
    }).catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id);
    readFileAsync('./db/db.json', 'utf8').then((data) => {
        const notes = JSON.parse(data) || [];
        const newNotesData = notes.filter((note) => note.id !== idToDelete);
        return writeFileAsync('./db/db.json', JSON.stringify(newNotesData));
    }).then(() => {
        res.json({ ok: true });
    }).catch((err) => {
        console.error(err);
        res.status(500).end();
    });
});

// HTML Routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
