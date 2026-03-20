const admin = require('firebase-admin');

function normalizarFecha(fecha) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calcularSiguienteFecha(fecha, recurrencia) {
  const nuevaFecha = new Date(fecha);

  switch (recurrencia) {
    case 'diaria':
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
      break;
    case 'semanal':
      nuevaFecha.setDate(nuevaFecha.getDate() + 7);
      break;
    case 'mensual':
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
      break;
    case 'anual':
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
      break;
    default:
      throw new Error(`Recurrencia no válida: ${recurrencia}`);
  }

  return nuevaFecha;
}

async function resetGastosFijosPorFecha() {
  try {
    console.log('[JOB] Entró a resetGastosFijosPorFecha');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    console.log('[JOB] Hoy:', hoy.toISOString());

    const snapshot = await admin.firestore().collection('gastosFijos').get();

    console.log('[JOB] Documentos encontrados:', snapshot.size);

    if (snapshot.empty) {
      console.log('[JOB] No se encontraron gastos fijos');
      return;
    }

    const batch = admin.firestore().batch();
    let actualizados = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      console.log('[JOB] Revisando documento:', {
        id: doc.id,
        nombreGasto: data.nombreGasto,
        pagado: data.pagado,
        proximaFechaReset: data.proximaFechaReset,
        recurrencia: data.recurrencia
      });

      if (!data.proximaFechaReset) {
        console.log('[JOB] Saltado: no tiene proximaFechaReset');
        return;
      }

      if (!data.pagado) {
        console.log('[JOB] Saltado: pagado ya está false');
        return;
      }

      const fechaReset = data.proximaFechaReset?.toDate
        ? data.proximaFechaReset.toDate()
        : new Date(data.proximaFechaReset);

      const fechaResetNormalizada = normalizarFecha(fechaReset);

      console.log('[JOB] Comparando fechas:', {
        hoy: hoy.toISOString(),
        fechaReset: fechaResetNormalizada.toISOString()
      });

      if (hoy.getTime() >= fechaResetNormalizada.getTime()) {
        const siguienteFecha = calcularSiguienteFecha(fechaReset, data.recurrencia);

        console.log('[JOB] Se actualiza documento:', {
          id: doc.id,
          siguienteFecha: siguienteFecha.toISOString()
        });

        batch.update(doc.ref, {
          pagado: false,
          proximaFechaReset: siguienteFecha.toISOString().split('T')[0]
        });

        actualizados++;
      }
    });

    if (actualizados > 0) {
      await batch.commit();
      console.log(`[JOB] Gastos fijos reseteados: ${actualizados}`);
    } else {
      console.log('[JOB] No hubo gastos para actualizar');
    }
  } catch (error) {
    console.error('[JOB] Error al resetear gastos fijos:', error);
  }
}

module.exports = {
  resetGastosFijosPorFecha,
};