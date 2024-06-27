const express = require('express');
const path = require('path');
const winston = require('winston');
const app = express();
const constraintsRoute = require('./routes/constraintsRoute');
const uploadRoute = require('./routes/uploadRoute');
const verifConstraintRoute = require('./routes/verifConstraintRoute');
const runRoute = require('./routes/runChocoRoute');
const algoSpmfRoute = require('./routes/algoSpmfRoute');
const verifParamSpmfRoute = require('./routes/verifParamSpmfRoute');
const spmfToContraintesRoute = require('./routes/spmfToContraintesRoute');
const exportJavaRoute = require('./routes/exportJavaRoute');

// Configuration de Winston pour logger les erreurs
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log' }),
        new winston.transports.Console()
    ]
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(constraintsRoute);
app.use(uploadRoute);
app.use(verifConstraintRoute);
app.use(runRoute);
app.use(algoSpmfRoute);
app.use(verifParamSpmfRoute);
app.use(spmfToContraintesRoute);
app.use(exportJavaRoute);

const server = app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Middleware pour capturer les erreurs
app.use((err, req, res, next) => {
    logger.error(`Erreur: ${err.message}`, { stack: err.stack });
    res.status(500).send('Something broke!');
});

// Gestion des erreurs non attrapées
process.on('uncaughtException', (error) => {
    logger.error('Erreur non attrapée', { message: error.message, stack: error.stack });
});

// Gestion des promesses rejetées non gérées
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Rejet non géré', { reason });
});

// Gestion des signaux de terminaison
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    cleanupAndExit();
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received.');
    cleanupAndExit();
});

// Fonction de nettoyage et d'arrêt
function cleanupAndExit() {
    server.close(() => {
        logger.info('Serveur arrêté.');
        process.exit(0); 
    });


    setTimeout(() => {
        logger.error('Forçage de l\'arrêt du processus.');
        process.exit(1);
    }, 5000); 
}
