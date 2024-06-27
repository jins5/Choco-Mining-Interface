const fs = require('fs');
const path = require('path');



function parseSpmfOutput(timestamp) {
    const filePath = path.join(__dirname, `/../javaRunner/src/main/resources/${timestamp}-output.txt`);
    const data = fs.readFileSync(filePath, 'utf8');

    const lines = data.split('\n').filter(line => line.trim() !== '');
    let solutions = lines.map(line => {
        const [solutionPart, freqPart] = line.split('#SUP:');
        const solution = solutionPart.trim().split(' ').join(', '); // Converting space-separated numbers to comma-separated string
        const freq = parseInt(freqPart.trim(), 10);
        return {
            solution,
            freq
        };
    });

    const numSolutions = solutions.length;



    return {
        numSolutions,
        solutions
    };
}


function parseJavaSolutions(output) {
    const numSolutionsMatch = output.match(/(\d+) solutions trouvées/);
    const numSolutions = numSolutionsMatch ? parseInt(numSolutionsMatch[1], 10) : 0;

    const solutionsStartIndex = output.indexOf("Début des solutions");
    const solutionsEndIndex = output.indexOf("Fin des solutions");

    let solutions = [];
    if (solutionsStartIndex !== -1 && solutionsEndIndex !== -1) {
        const solutionsText = output.substring(solutionsStartIndex + "Début des solutions".length, solutionsEndIndex).trim();
        const solutionLines = solutionsText.split('\n');

        solutions = solutionLines.map(line => {
            const match = line.match(/\[(.*?)\], freq=(\d+)/);
            return {
                solution: match ? match[1] : '',
                freq: match ? parseInt(match[2], 10) : '',

            };
        });
    }

    // enlve les espaces dans les solutions
    // solutions = solutions.map(solution => {
    //     return {
    //         solution: solution.solution.replace(/\s/g, ''),
    //         freq: solution.freq,
    //         feedback: solution.feedback
    //     };
    // });


    return {
        numSolutions,
        solutions
    };



}





module.exports = {
    parseSpmfOutput,
    parseJavaSolutions
};