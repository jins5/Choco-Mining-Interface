
async function traductionVar(variables) {
    if (!variables) {
        console.error("No variables provided");
        return { variables: [] };
    }

    let variablesArray = variables.split(';').map(v => v.trim());

    let finalVariables = [];

    variablesArray.forEach(variable => {
        let parts = variable.split('=').map(part => part.trim());
        if (parts.length < 2) {
            console.error(`Invalid variable format: "${variable}"`);
            return; 
        }
        let varName = parts[0];
        let varValue = parts[1];

        if (varValue.includes('..')) {
            let rangeParts = varValue.split('..').map(part => part.trim());
            let rangeStart = rangeParts[0];
            let rangeEnd = rangeParts[1];
            if (isNaN(rangeEnd)) {
                finalVariables.push(`IntVar ${varName} = model.intVar("${varName}", ${rangeStart}, database.get${rangeEnd}());`);
            } else {
                finalVariables.push(`IntVar ${varName} = model.intVar("${varName}", ${rangeStart}, ${rangeEnd});`);
            }
        } else if (!isNaN(varValue)) {
            finalVariables.push(`IntVar ${varName} = model.intVar("${varName}", ${varValue});`);
        } else if (varValue.toLowerCase() === 'true' || varValue.toLowerCase() === 'false') {
            finalVariables.push(`BoolVar ${varName} = model.boolVar("${varName}", ${varValue.toLowerCase()});`);
        } else {
            finalVariables.push(`${varName}: string = "${varValue}";`);
        }
    });

    return { variables: finalVariables };
}


module.exports = traductionVar;