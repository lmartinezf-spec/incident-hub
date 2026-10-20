const dashboardModel = require('../models/dashboard.model');

async function obtener(req, res) {
  res.json(await dashboardModel.obtenerIndicadores());
}

module.exports = { obtener };
