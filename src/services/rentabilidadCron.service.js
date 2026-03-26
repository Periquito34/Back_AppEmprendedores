const { admin, db } = require('../config/firebase');
const { crearRentabilidadMensualService } = require('./rentabilidadMensual.service');

function esUltimoDiaDelMes(fecha = new Date()) {
  const manana = new Date(fecha);
  manana.setDate(fecha.getDate() + 1);
  return manana.getDate() === 1;
}
/*
async function ejecutarRentabilidadFinDeMes() {
  try {
    const hoy = new Date();

    console.log('[JOB RENTABILIDAD] Ejecutando proceso...');
    console.log('Fecha:', hoy);

    // 🔥 FORZAR EJECUCIÓN
    const forzar = true;

    if (!esUltimoDiaDelMes(hoy) && !forzar) {
      console.log('[JOB RENTABILIDAD] No es fin de mes');
      return;
    }

    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

    console.log('Year:', year);
    console.log('Month:', month);

    // 🔹 traer negocios
    const negociosSnap = await db.collection('businesses').get();

    if (negociosSnap.empty) {
      console.log('[JOB RENTABILIDAD] No hay negocios');
      return;
    }

    for (const doc of negociosSnap.docs) {
      const idNegocio = doc.id;

      console.log('Procesando negocio:', idNegocio);

      try {
        await crearRentabilidadMensualService(idNegocio, year, month);
        console.log(`OK negocio ${idNegocio}`);
      } catch (error) {
        console.error(`Error en negocio ${idNegocio}:`, error.message);
      }
    }

    console.log('[JOB RENTABILIDAD] Proceso terminado');

  } catch (error) {
    console.error('[JOB RENTABILIDAD] Error general:', error);
  }
}
  */

async function ejecutarRentabilidadFinDeMes() {
  try {
    const hoy = new Date();

    console.log('[JOB RENTABILIDAD] Fecha actual:', hoy.toISOString());

    if (!esUltimoDiaDelMes(hoy)) {
      console.log('[JOB RENTABILIDAD] Hoy no es el último día del mes');
      return;
    }

    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;

    console.log(`[JOB RENTABILIDAD] Ejecutando cierre para ${year}-${month}`);

    const negociosSnap = await db.collection('businesses').get();

    if (negociosSnap.empty) {
      console.log('[JOB RENTABILIDAD] No se encontraron negocios');
      return;
    }

    for (const doc of negociosSnap.docs) {
      const idNegocio = doc.id;

      try {
        await crearRentabilidadMensualService(idNegocio, year, month);
        console.log(`[JOB RENTABILIDAD] OK negocio ${idNegocio}`);
      } catch (error) {
        console.error(`[JOB RENTABILIDAD] Error en negocio ${idNegocio}:`, error.message);
      }
    }

    console.log('[JOB RENTABILIDAD] Proceso finalizado');
  } catch (error) {
    console.error('[JOB RENTABILIDAD] Error general:', error);
  }
}


module.exports = {
  ejecutarRentabilidadFinDeMes,
};
