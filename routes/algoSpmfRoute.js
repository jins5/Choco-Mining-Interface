const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


router.get('/algospmf', (req, res) => {
    const filePath = path.join(__dirname, '../spmf.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        try {
            const algos = JSON.parse(data);
            res.json(algos);
        } catch (e) {
            res.status(500).send('Error parsing JSON');
        }
    });
});

module.exports = router;