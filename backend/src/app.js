const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const rutasApi = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '100kb' }));
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use('/api', rutasApi);
app.use('/api', rutaNoEncontrada);

// En staging/producción el frontend compilado se publica en backend/public
// y Express lo sirve junto con la API (una sola aplicación por ambiente).
const carpetaPublica = path.join(__dirname, '..', 'public');
if (fs.existsSync(path.join(carpetaPublica, 'index.html'))) {
  app.use(express.static(carpetaPublica));
  app.get('/{*ruta}', (req, res) => res.sendFile(path.join(carpetaPublica, 'index.html')));
}

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
