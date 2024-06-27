const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const validateParams = require('../utils/validateParams')
const knownVariables = {
    database: 'TransactionalDatabase',
    freq: 'IntVar',
    length: 'IntVar',
    x: 'BoolVar[]'
};
router.post('/verificationsConstraintes',  async (req, res) => {
    let {constraints} = req.body;

 

    const functionDefs = JSON.parse(fs.readFileSync(path.join(__dirname, '../function.json'), 'utf8'));
    let invalidConstraints = [];

    for (let { text: constraintText, signature } of constraints) {
        let parts = constraintText.match(/(\w+)\(([^)]+)\)/);
        if (!parts || parts.length < 3) {
            invalidConstraints.push({ constraint: constraintText, message: 'Invalid format' });
            continue;
        }

        let constraintName = parts[1];
        let paramBlob = parts[2];
        let params = parseParams(paramBlob);

        const funcDef = functionDefs.find(f => f.name === constraintName);
        if (!funcDef) {
            invalidConstraints.push({ constraint: constraintText, message: 'Unsupported constraint type' });
            continue;
        }

        // Validate the parameters against the provided signature
        if (!validateParams(params, signature.types, knownVariables)) {
            invalidConstraints.push({ constraint: constraintText, message: 'Parameter types do not match' });
            continue;
        }
    }

    if (invalidConstraints.length > 0) {
        return res.status(400).json({ valid: false, invalidConstraints });
    }

    res.json({ valid: true });

});


function parseParams(paramBlob) {
    return paramBlob.split(',').map(param => param.trim());
}


module.exports = router;