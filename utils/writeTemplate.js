const fs = require('fs');
const path = require('path');

async function writeItTemplate(fileNameUpload, variables, className) {
    const templatePath = path.join(__dirname, 'TemplateJava.java');
    const projectRoot = path.resolve(__dirname, '..');
    const targetDir = path.join(projectRoot, 'javaRunner', 'src', 'main', 'java', 'org', 'example');
    const dataFile = path.join(targetDir, `${className}.java`);

    const ressourceDir = path.join(projectRoot, 'javaRunner', 'src', 'main', 'resources');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(templatePath, dataFile);

    let content = fs.readFileSync(dataFile, 'utf8');
    content = content.replace(/public class TemplateJava \{/, `public class ${className} {`);
    content = content.replace(
        /Base_de_donnees_a_changer/,
        `TransactionalDatabase database = new DatReader("src/main/resources/${fileNameUpload}").read();`
    );

    const variablesString = variables.join('\n');
    content = content.replace(
        /Solver solver = model.getSolver\(\);/,
        `${variablesString}\n\n        Solver solver = model.getSolver();`
    );

    fs.writeFileSync(dataFile, content);

    console.log(`Duplicate file created at ${dataFile}`);
}



async function ecrirePrintSolutionDansFile(fileNameJava,maxSolution) {


    const filePath = path.join(__dirname, `/../javaRunner/src/main/java/org/example/${fileNameJava}.java`);
    
    maxSolution = parseInt(maxSolution);
    if(isNaN(maxSolution)){
        maxSolution = -1;
    }
    let         dataSolveur = [      ` int count =0;` ,  
        'while (solver.solve()) {',  'if(count == '+maxSolution+' ) {' , 'break;' , '}',
        'int[] itemset = IntStream.range(0, x.length)', 
        '.filter(i -> x[i].getValue() == 1)', 
        '.map(i -> database.getItems()[i])', 
        '.toArray();',
        'soluce.add(new Pattern(itemset, new int[]{freq.getValue()}));',
        'count++;',
        '}',
       
    ]


    let dataPrintSolution = [
        'System.out.println(soluce.size() + " solutions trouvées");', 
        'System.out.println("Début des solutions");',
        'for (Pattern closed : soluce) {', 
        ' System.out.println(Arrays.toString(closed.getItems()) + ", freq=" + closed.getMeasures()[0]);',
        '}', 
        'System.out.println("Fin des solutions");'
    ];

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');

        const startMarker = '// SOLVEUR WHILE';
        const endMarker = '// fin SOLVEUR WHILE';
        const startMarkerPrint = '// PRINT SOLUTION';
        const endMarkerPrint = '// fin PRINT SOLUTION';

        const regex = new RegExp(`(${startMarker})([\\s\\S]*?)(${endMarker})`, 'g');
        const regexPrint = new RegExp(`(${startMarkerPrint})([\\s\\S]*?)(${endMarkerPrint})`, 'g');

        const updatedData = data.replace(regex, `${startMarker}\n${dataSolveur.join('\n')}\n${endMarker}`);
        const updatedData2 = updatedData.replace(regexPrint, `${startMarkerPrint}\n${dataPrintSolution.join('\n')}\n${endMarkerPrint}`);

        await fs.promises.writeFile(filePath, updatedData2, 'utf8');

        console.log('Le solveur et les solutions ont été ajoutés avec succès.');

    } catch (err) {
        console.error(err);
    }
}


async function ecrireContraintesDansFile(contraintes, filenameJava) {
    
    const filePath = path.join(__dirname, `../javaRunner/src/main/java/org/example/${filenameJava}.java`);

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');

        const startMarker = '// CONTRAINTES';
        const endMarker = '// fin CONTRAINTES';
        const regex = new RegExp(`(${startMarker})([\\s\\S]*?)(${endMarker})`, 'g');

        const updatedData = data.replace(regex, `${startMarker}\n${contraintes.join('\n')}\n${endMarker}`);

        await fs.promises.writeFile(filePath, updatedData, 'utf8');

        console.log('Les contraintes ont été ajoutées avec succès.');
        

    } catch (err) {
        console.error(err);
    }
}

module.exports = { writeItTemplate, ecrirePrintSolutionDansFile, ecrireContraintesDansFile}