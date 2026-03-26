const cron = require('node-cron');
const { ejecutarRentabilidadFinDeMes } = require('../services/rentabilidadCron.service');

function iniciarJobRentabilidad() {
  cron.schedule('50 23 * * *', async () => {
    console.log('[CRON] Verificando cierre mensual de rentabilidad...');
    await ejecutarRentabilidadFinDeMes();
  });
  
  console.log('[CRON] Job de rentabilidad iniciado');
}

module.exports = {
  iniciarJobRentabilidad,
};


/*
  cron.schedule('* * * * *', async () => {
  console.log('[CRON] Ejecutando prueba de rentabilidad...');
  await ejecutarRentabilidadFinDeMes();
});
*/