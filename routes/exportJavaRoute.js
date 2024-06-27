const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


router.post('/exportJava', (req, res) => {

    let timeStampsRecupSurLefichier = req.body.fileName.split('_');
    timeStampsRecupSurLefichier = timeStampsRecupSurLefichier[0]
    let filenameJava = `ConstraintSolver${timeStampsRecupSurLefichier}`;
    const filePath = path.join(__dirname, `/../javaRunner/src/main/java/org/example/${filenameJava}.java`);

    // fait lui télécharger le fichier
   if(fs.existsSync(filePath)){
    res.download(filePath);
   }
});


module.exports = router;