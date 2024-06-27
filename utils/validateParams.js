function validateParams(params, types, knownVariables) {
    return params.every((param, index) => {
        const expectedType = types[index];
        const value = param.trim();
        if(value.includes('int')) {
            return true;
        }
        if (expectedType === 'string') {
            return knownVariables[value] ? knownVariables[value] === 'string' : true;
        } else if (expectedType === 'BoolVar[]') {
            return knownVariables[value] && knownVariables[value] === 'BoolVar[]';
        } else if (expectedType === 'IntVar') {
            return (knownVariables[value] && knownVariables[value] === 'IntVar') || !isNaN(parseInt(value));
        } else if (expectedType === 'TransactionalDatabase') {
            return value === 'database' || (knownVariables[value] && knownVariables[value] === 'TransactionalDatabase');
        } else if (expectedType === 'operator') {
            return value === '=' || value === '!=' || value === '<' || value === '>' || value === '<=' || value === '>=';
        }else if (expectedType === 'IntVar_Ou_Pourcentage') {
            const percentagePattern = /^0\.\d+%$/;
            return (knownVariables[value] && knownVariables[value] === 'IntVar') || !isNaN(parseInt(value)) || percentagePattern.test(value);
        }

        return false; 
    });
}

module.exports = validateParams;