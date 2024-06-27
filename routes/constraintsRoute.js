const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/constraints', (req, res) => {
    fs.readFile(path.join(__dirname, '../function.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading constraints file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(JSON.parse(data));
    });
});

module.exports = router;
