const fs = require('fs');
const path = require('path');
const  validateParams  = require('./validateParams');

async function translateConstraints(constraints, knownVariables, spmfFlag = false) {
    const functionDefs = JSON.parse(fs.readFileSync(path.join(__dirname, '../function.json'), 'utf8'));
    let finalConstraintsCode = [];

    for (let { text: constraintText, signature } of constraints) {
        let parts = constraintText.match(/(\w+)\((.+)\)/s); 
        if (!parts || parts.length < 3) {
            console.error(`Invalid format: "${constraintText}"`);
            continue;
        }

        let constraintName = parts[1];
        let paramBlob = parts[2];
        let params = parseParams(paramBlob);

        const funcDef = functionDefs.find(f => f.name === constraintName);
        if (!funcDef) {
            console.error(`Unsupported constraint type: "${constraintName}"`);
            continue;
        }

        if (!spmfFlag) {
            if (!validateParams(params, signature.types, knownVariables)) {
                console.error(`Parameter types do not match for ${constraintName}. Expected types: ${signature.types.join(", ")}`);
                continue;
            }
        }

        let constraintCode = signature.template;
        params.forEach((param, index) => {
            if (param.includes('%')) {
                param = param.replace('%', '');
                constraintCode = constraintCode.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), `(int) Math.ceil(database.getNbTransactions() * ${param})`);

            } else {
            constraintCode = constraintCode.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), param.trim());
            }
        });

        finalConstraintsCode.push(constraintCode);
    }

    return { constraintsCode: finalConstraintsCode };
}

function parseParams(paramBlob) {
    let params = [];
    let currentParam = '';
    let inQuotes = false;
    let parenthesisCount = 0;

    for (let i = 0; i < paramBlob.length; i++) {
        let char = paramBlob[i];
        if (char === ',' && !inQuotes && parenthesisCount === 0) {
            params.push(currentParam.trim());
            currentParam = '';
        } else {
            currentParam += char;
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === '(') {
                parenthesisCount++;
            } else if (char === ')') {
                parenthesisCount--;
            }
        }
    }
    // Add the last parameter
    if (currentParam) {
        params.push(currentParam.trim());
    }

    return params;
}

module.exports = translateConstraints;



