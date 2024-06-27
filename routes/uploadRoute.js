const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const {writeItTemplate} = require('../utils/writeTemplate');
const multer = require('multer');
const { exec } = require('child_process');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './javaRunner/src/main/resources/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});



const upload = multer({
    storage: storage
});


router.post('/upload', upload.single('file'), async (req, res) => {
    if (req.file) {
        const variables = [
            'BoolVar[] x = model.boolVarArray("x", database.getNbItems());',
            'IntVar freq = model.intVar("freq", 1, database.getNbTransactions());',
            'IntVar length = model.intVar("length", 1, database.getNbItems());'
        ];

        
        

        let timeStampsRecupSurLefichier = req.file.filename.split('_');
        timeStampsRecupSurLefichier = timeStampsRecupSurLefichier[0]
        
        let filenameJava = `ConstraintSolver${timeStampsRecupSurLefichier}`;
        
        await writeItTemplate(req.file.filename, variables, filenameJava);

        try {
            const result = await runJavaFile(filenameJava);
           
            res.json(result);
        } catch (error) {
            console.error('Failed to run Java file:', error);
            res.status(500).send('Failed to run Java file');
        }
    } else {
        res.status(400).send('No file uploaded');
    }
}
);

async function runJavaFile(filenameJava) {
    const projectDir = path.resolve(__dirname, '../javaRunner');

    return new Promise((resolve, reject) => {
        const command = `mvn exec:java -Dexec.mainClass="org.example.${filenameJava}"`;

        exec(command, { cwd: projectDir, maxBuffer : Infinity }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Java file: ${error}`);
                console.error(stderr);
                reject(error);
                return;
            }
            const result = parseJavaVariablesFirstLaunch(stdout);
            
            resolve(result);
        });
    });
}

function parseJavaVariablesFirstLaunch(output) {
  
    let freqMatch = output.match(/freq\s*=\s*{([^}]*)}/);
    if (!freqMatch) {
        freqMatch = output.match(/freq\s*=\s*\[([^\]]*)\]/);
    }
    const lengthMatch = output.match(/length\s*=\s*{([^}]*)}/);
    const xMatch = output.match(/x\[\d+\]\s*=\s*\[\d,\d\]/g);

    const freq = freqMatch ? freqMatch[1] : null;
    const length = lengthMatch ? lengthMatch[1] : null;
    const xValues = xMatch ? `${xMatch[0]}, ..., ${xMatch[xMatch.length - 1]}` : '';

    return { freq, length, xValues };
}

module.exports = router;