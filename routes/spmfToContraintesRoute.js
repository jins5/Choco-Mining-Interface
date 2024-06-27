const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const translateConstraints = require('../utils/translateConstraints');
const { verifierEtAjouterContraintes, supprimerContraintesViaTimestamp, removeContraintesDansFile } = require('../utils/verifierEtAjouterContraintes');
const {ecrireContraintesDansFile} = require('../utils/writeTemplate');
const knownVariables = {
    database: 'TransactionalDatabase',
    freq: 'IntVar',
    length: 'IntVar',
    x: 'BoolVar[]'
};

router.post('/spmfToContraintes', async (req, res) => {
    


    let algo = req.body.algo;

    const filePath = path.join(__dirname, '../spmf.json');
    const data = fs.readFileSync(filePath, 'utf8');
    let fileName = req.body.fileName;
    let timeStampsRecupSurLefichier = fileName.split('_');
    timeStampsRecupSurLefichier = timeStampsRecupSurLefichier[0]
    const spmfJson = JSON.parse(data);
    let filenameJava = `ConstraintSolver${timeStampsRecupSurLefichier}`;

    let traductionEnContraintes = getTraductionEnContraintes(algo.name, spmfJson);
    if (!traductionEnContraintes) {
        return res.status(400).send('No translation available for this algorithm');
    }


   
    for (let i = 0; i < algo.values.length; i++) {
        traductionEnContraintes = traductionEnContraintes.replace(`\${${i}}`, algo.values[i].value);
    }

    
    traductionEnContraintes =  transformInputData(traductionEnContraintes);
   
   let {constraintsCode} = await translateConstraints(traductionEnContraintes, knownVariables, true);

    

   verifierEtAjouterContraintes(timeStampsRecupSurLefichier, constraintsCode);

    let ConstraintToDelete = supprimerContraintesViaTimestamp(timeStampsRecupSurLefichier, constraintsCode);

    removeContraintesDansFile(ConstraintToDelete, filenameJava);

    if (constraintsCode.length === 0) {
        return res.status(400).send('Impossible de traduire les contraintes');
    }

    for({text : constraintText} of traductionEnContraintes){
       let newCon = removeAndReplaceExpression(constraintText);
       if(newCon !== constraintText){
        traductionEnContraintes = traductionEnContraintes.map(constraint => {
            if(constraint.text === constraintText){
                return {
                    text: newCon,
                    signature: constraint.signature
                };
            }
            return constraint;
        } 
        );
          
       }
    }

    ecrireContraintesDansFile(constraintsCode , filenameJava);

    res.json({ traductionEnContraintes });
    
});


function transformInputData(inputData) {
    const functionDefs = JSON.parse(fs.readFileSync(path.join(__dirname, '../function.json'), 'utf8'));
    let constraints = inputData.split('|').map(item => item.trim().replace(/;$/, ''));
    let transformedConstraints = constraints.map(constraint => {
        let parts = constraint.match(/(\w+)\(([^)]+)\)/);
        if (!parts || parts.length < 3) {
            console.error(`Invalid format: "${constraint}"`);
            return null;
        }

        let constraintName = parts[1];
        let paramBlob = parts[2].split(',').map(param => param.trim());
        
        const funcDef = functionDefs.find(f => f.name === constraintName);
        if (!funcDef) {
            console.error(`Unsupported constraint type: "${constraintName}"`);
            return null;
        }
        
        let signature = funcDef.signatures.find(sig => sig.params === paramBlob.length);
        if (!signature) {
            console.error(`No matching signature for ${constraintName} with ${paramBlob.length} parameters.`);
            return null;
        }

        return {
            text: constraint,
            signature: signature
        };
    });

    // Filtrer les contraintes nulles dues à des erreurs de parsing ou d'appariement
    return transformedConstraints.filter(constraint => constraint !== null);
}

function getTraductionEnContraintes(algoName, spmfJson) {
    for (const item of spmfJson) {
        let has = item.all_algo.includes(algoName)
        if (has ) {
            
            return item.traductionEnContraintes || null;
        }
    }
    return null;
}



function removeAndReplaceExpression(input) {
    const expressionPattern = "(int) Math.ceil(database.getNbTransactions() *".toLowerCase().replace(/\s+/g, '');
    const lowerCaseInput = input.toLowerCase().replace(/\s+/g, '');
  
    const expressionStartIndex = lowerCaseInput.indexOf(expressionPattern);
  
    if (expressionStartIndex === -1) {
      // Si le modèle spécifique n'est pas trouvé dans la chaîne
      return input;
    }
  
    const beforeExpression = input.substring(0, expressionStartIndex);
    const restOfString = input.substring(expressionStartIndex + expressionPattern.length);
  
    // Trouver l'index de la dernière parenthèse fermante correspondante dans la chaîne originale
    let closingParenIndex = -1;
    let parenCount = 1;
  
    for (let i = 0; i < restOfString.length; i++) {
      if (restOfString[i] === '(') {
        parenCount++;
      } else if (restOfString[i] === ')') {
        parenCount--;
        if (parenCount === 0) {
          closingParenIndex = i;
          break;
        }
      }
    }
  
    if (closingParenIndex === -1) {
      // Si aucune parenthèse fermante n'est trouvée
      return input;
    }
  
    // Extraire le facteur multiplié par getNbTransactions()
    const factorString = restOfString.substring(0, closingParenIndex).trim();
  
    // Chercher le dernier chiffre après l'astérisque
    const factorMatch = factorString.match(/\*\s*([\d.]+)/);
    if (!factorMatch) {
      // Si le facteur n'est pas trouvé
      return input;
    }
  
    const factor = parseFloat(factorMatch[1]);
  
    if (isNaN(factor)) {
      // Si le facteur n'est pas un nombre valide
      return input;
    }
  
    const resultNumber = factor
  
    const afterExpression = restOfString.substring(closingParenIndex + 1).trim();
  
    // Reconstruire la chaîne avec le nombre remplacé suivi de %
    return beforeExpression + ',' + resultNumber + '%' + afterExpression;
  }


module.exports = router;