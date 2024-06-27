const fs = require('fs');
const path = require('path');


let constraintAlreadyWritten = new Map();


function verifierEtAjouterContraintes(timestamp, contraintes) {
    if (!constraintAlreadyWritten.has(timestamp)) {
        constraintAlreadyWritten.set(timestamp, []);
    }

    let existingConstraints = constraintAlreadyWritten.get(timestamp);

    contraintes.forEach(contrainte => {
        if (!existingConstraints.includes(contrainte)) {
            console.log("Contrainte ajoutée: " + contrainte);
            existingConstraints.push(contrainte);
        }
    });

    constraintAlreadyWritten.set(timestamp, existingConstraints);
}


function supprimerContraintesViaTimestamp(timestamp, constraintsCode) {
    if (!constraintAlreadyWritten.has(timestamp)) {
        console.log(`Aucune contrainte trouvée pour le timestamp: ${timestamp}`);
        return;
    }

    let existingConstraints = constraintAlreadyWritten.get(timestamp);
    let constraintsToDelete = existingConstraints.filter(contrainte => !constraintsCode.includes(contrainte));

    constraintAlreadyWritten.set(timestamp, existingConstraints.filter(contrainte => constraintsCode.includes(contrainte)));

    console.log(`Contraintes supprimées pour le timestamp ${timestamp}:`, constraintsToDelete);
    return constraintsToDelete;
}


function removeContraintesDansFile(contraintes, filenameJava) {
    const filePath = path.join(__dirname, `/../javaRunner/src/main/java/org/example/${filenameJava}.java`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let updatedData = data;
        contraintes.forEach(chaine => {
            updatedData = updatedData.replace(chaine, '');
            console.log('La chaîne de caractères a été supprimée avec succès.');
        });

        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('La chaîne de caractères a été supprimée avec succès.');
        });
    });
}


module.exports = { verifierEtAjouterContraintes, supprimerContraintesViaTimestamp, removeContraintesDansFile };