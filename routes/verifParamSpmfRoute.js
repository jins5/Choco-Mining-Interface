const express  = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');



router.post('/verifieParamsModele', (req, res) => {
    let params = req.body.params;
    const filePath = path.join(__dirname, '../spmf.json');

    for (let i = 0; i < params.length; i++) {
        let description = params[i].desc;
        let value = params[i].value;
        let algoType = getAlgorithmTypesByDescription(description, filePath);

        if (algoType && algoType.includes('pourcentage')) {
            if (parseFloat(value) >= 0 && parseFloat(value) <= 1 && !isNaN(value)) {
                continue;
            } else {
                return res.status(400).json({ valid: false, message: `Le paramètre ${i + 1} (${value})n'est pas un pourcentage valide. Il doit être un nombre entre 0 et 1.` });
            }
        } else {
            return res.status(400).json({ valid: false, message: `La description du paramètre ${i + 1} ne correspond pas à un type de pourcentage.` });
        }
    }
    
    res.json({ valid: true, message: 'Tous les paramètres sont valides.' });
});



function getAlgorithmTypesByDescription(description, filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const allAlgo = JSON.parse(data);

    const algoObj = allAlgo.find(algo => algo.description === description);

    return algoObj ? algoObj.types : null;
}

module.exports = router;