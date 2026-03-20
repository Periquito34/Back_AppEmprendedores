const cron = require('node-cron');
const { resetGastosFijosPorFecha } = require('../services/resetGastosFijos.service');

function iniciarJobGastosFijos() {
  cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Ejecutando job de gastos fijos...');
  await resetGastosFijosPorFecha();
});

  console.log('[CRON] Job de gastos fijos iniciado');
}

module.exports = {
  iniciarJobGastosFijos,
};