const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const translateConstraints = require('../utils/translateConstraints');
const {verifierEtAjouterContraintes, removeContraintesDansFile, supprimerContraintesViaTimestamp} = require('../utils/verifierEtAjouterContraintes')
const {ecrireContraintesDansFile, ecrirePrintSolutionDansFile} = require('../utils/writeTemplate');
const {parseJavaSolutions, parseSpmfOutput} = require('../utils/parserOutput')
const knownVariables = {
    database: 'TransactionalDatabase',
    freq: 'IntVar',
    length: 'IntVar',
    x: 'BoolVar[]'
};


router.post('/run', async (req, res) => {
    const { constraints } = req.body;
   let fileUploaded = constraints[0].fileName;
    let timeStampsRecupSurLefichier = fileUploaded.split('_');
    timeStampsRecupSurLefichier = timeStampsRecupSurLefichier[0]
    let filenameJava = `ConstraintSolver${timeStampsRecupSurLefichier}`;
    let pattern = req.body.pattern;
    let maxSolution = req.body.maxSolutions;



   
    if (!filenameJava) {
        return res.status(400).send('No Java file available to run');
    }
    const existingData = fs.readFileSync(__dirname + `/../javaRunner/src/main/resources/${fileUploaded}`, 'utf8');
    
   
    try {
        if (req.body.constraints[0].easyMode) {
            let result = await runSpmf(req.body.constraints[0], fileUploaded, maxSolution, pattern);
            if(pattern) {
                let data = existingData.split('\n');
                let items = extractItems(data, pattern);
                if(items) {
                result.solutions = processSolution(result.solutions, items);
                } 
            }
            return res.json(result);
        }
    } catch (error) {
        res.status(500).send(`Error processing request: ${error.message}`);
    }



   

    const { constraintsCode } = await translateConstraints(constraints, knownVariables);

    verifierEtAjouterContraintes(timeStampsRecupSurLefichier, constraintsCode);

    let ConstraintToDelete = supprimerContraintesViaTimestamp(timeStampsRecupSurLefichier, constraintsCode);

    removeContraintesDansFile(ConstraintToDelete, filenameJava);

    if (constraintsCode.length === 0) {
        return res.status(400).send('Impossible de traduire les contraintes');
    }
    await ecrirePrintSolutionDansFile(filenameJava, maxSolution);
    ecrireContraintesDansFile(constraintsCode , filenameJava);

    try {
        const result = await runJavaFileWithConstraints(filenameJava);
       
        if(pattern) {
            let data = existingData.split('\n');
            let items = extractItems(data, pattern);
            if(items) {
            result.solutions = processSolution(result.solutions, items);
            } 
        }
        res.json(result );
    } catch (error) {
        console.error('Failed to run Java file:', error);
        res.status(500).send('Failed to run Java file');
    }
}
);



async function runSpmf(body, fileUploaded, maxSolution, pattern) {
    let timestamp = Date.now();
    let command = `java -jar spmf.jar run ${body.name} ../javaRunner/src/main/resources/${fileUploaded} ../javaRunner/src/main/resources/${timestamp}-output.txt ${body.values[0]*100}%`;
   
    try {
        await execPromise(command, { cwd: path.join(__dirname, '../utils/') });
        
        let result = parseSpmfOutput(timestamp, pattern);
        if(maxSolution > 0){
            result.solutions = result.solutions.slice(0, maxSolution);
        }
        return result;
        
    } catch (error) {
        console.error(`Error executing Java file: ${error}`);
        throw error;
    }
}


async function runJavaFileWithConstraints(filenameJava) {
    const projectDir = path.resolve(__dirname, '../javaRunner');
    return new Promise((resolve, reject) => {
        const command = `mvn exec:java -Dexec.mainClass="org.example.${filenameJava}" `;

        exec(command, { cwd: projectDir, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Java file: ${error}`);
                console.error(stderr);
                reject(error);
                return;
            }

            const result = parseJavaSolutions(stdout);
           
            resolve(result);
        });
    });
}


function extractItems(lines, pattern) {
    const items = {};
    const regex = new RegExp(pattern.replace('<nom>', '\\s*(\\w+)\\s*').replace('<item>', '\\s*(\\d+)\\s*'));
    let found = false;
    
    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        found = true;
        const id = match[1];
        const name = match[2];
        items[id] = name;
      }
    });
  
    return found ? items : null;
  }

  function processSolution(solution, items) {
    if (!items) {
      console.error('Aucun item trouvé avec le pattern spécifié.');
      return null;
    }
  
    const newSolution = solution.map(entry => {
      const ids = entry.solution.split(', ').map(id => id.trim());
      const names = ids.map(id => items[id] || id);
      return {
        solution: names.join(', '),
        freq: entry.freq,
      };
    });
  
    return newSolution;
  }


  module.exports = router;