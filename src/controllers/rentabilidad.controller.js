const { admin, db } = require('../config/firebase');
const RentabilidadMensual = require('../models/rentabilidad.model');

// POST /rentabilidad/:idNegocio/:year/:month
async function createRentabilidadMensual(req, res) {
  try {
    const { idNegocio, year, month } = req.params;

    if (!idNegocio || !year || !month) {
      return res.status(400).json({ message: 'idNegocio, year y month son requeridos' });
    }

    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // ----------------------------
    // 1. Resumen de ventas (ingresos y costos variables)
    // ----------------------------
    const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0, 0);
    const endDate   = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    const ventasSnap = await db
      .collection('ventas')
      .where('idNegocio', '==', idNegocio)
      .where('fechaVenta', '>=', startDate)
      .where('fechaVenta', '<=', endDate)
      .get();

    let ingresos = 0;
    let costosVariables = 0;

    ventasSnap.forEach(doc => {
      const v = doc.data();
      ingresos += Number(v.totalVenta) || 0;
      costosVariables += Number(v.totalCostoProduccion) || 0;
    });

    // ----------------------------
    // 2. Gastos fijos (todos los gastos fijos del negocio)
    // ----------------------------
    const gastosFijosSnap = await db
      .collection('gastosFijos')
      .where('idNegocio', '==', idNegocio)
      .get();

    let gastosFijos = 0;
    gastosFijosSnap.forEach(doc => {
      gastosFijos += Number(doc.get('costoGasto')) || 0;
    });

    // ----------------------------
    // 3. Egresos (transacciones tipo = true del mes)
    // ----------------------------
    const egresosSnap = await db
      .collection('transacciones')
      .where('idNegocio', '==', idNegocio)
      .where('tipo', '==', true) // true = egreso
      .where('fecha', '>=', startDate)
      .where('fecha', '<=', endDate)
      .get();

    let egresos = 0;
    egresosSnap.forEach(doc => {
      egresos += Number(doc.get('monto')) || 0;
    });

    // ----------------------------
    // 4. Construir modelo RentabilidadMensual
    // ----------------------------
    const rentCol = db.collection('rentabilidadesMensuales');
    const idResumen = rentCol.doc().id;

    const newResumen = new RentabilidadMensual(
      idResumen,
      idNegocio,
      yearInt,
      monthInt,
      ingresos,
      costosVariables,
      gastosFijos,
      egresos
    );

    // ----------------------------
    // 5. Guardar en Firestore
    // ----------------------------
    await rentCol.doc(idResumen).set({
      idResumen: newResumen.idResumen,
      idNegocio: newResumen.idNegocio,
      year: newResumen.year,
      month: newResumen.month,
      ingresos: newResumen.ingresos,
      costosVariables: newResumen.costosVariables,
      gastosFijos: newResumen.gastosFijos,
      egresos: newResumen.egresos,
      rentabilidadNeta: newResumen.rentabilidadNeta,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({
      message: 'Rentabilidad mensual registrada con éxito',
      data: newResumen
    });

  } catch (error) {
    console.error('Error al registrar rentabilidad mensual:', error);
    return res.status(500).json({
      message: 'Error al registrar rentabilidad mensual',
      error: error.message
    });
  }
}

async function computeRentabilidadMes(idNegocio, yearInt, monthInt) {
  // Rango [start, next)
  const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0, 0);
  const nextDate  = new Date(yearInt, monthInt, 1, 0, 0, 0, 0);

  // 1) Ventas del mes → ingresos + costos variables
  const ventasSnap = await db
    .collection('ventas')
    .where('idNegocio', '==', idNegocio)
    .where('fechaVenta', '>=', startDate)
    .where('fechaVenta', '<', nextDate)
    .get();

  let ingresos = 0;
  let costosVariables = 0;

  ventasSnap.forEach(doc => {
    const v = doc.data();
    const cantidad = Number(v.cantidadVendida) || 0;
    const precio   = Number(v.precioUnitario) || 0;
    const costoU   = Number(v.costoProduccion) || 0;

    const totalVenta = (v.totalVenta !== undefined) ? Number(v.totalVenta) : (cantidad * precio);
    const totalCosto = (v.totalCostoProduccion !== undefined) ? Number(v.totalCostoProduccion) : (cantidad * costoU);

    ingresos += totalVenta || 0;
    costosVariables += totalCosto || 0;
  });

  // 2) Gastos fijos (monto mensual configurado por negocio)
  const gastosFijosSnap = await db
    .collection('gastosFijos')
    .where('idNegocio', '==', idNegocio)
    .get();

  let gastosFijos = 0;
  gastosFijosSnap.forEach(doc => {
    gastosFijos += Number(doc.get('costoGasto')) || 0;
  });

  // 3) Egresos del mes (excluye gastos fijos si también los registras como transacción)
  const egresosSnap = await db
    .collection('transacciones')
    .where('idNegocio', '==', idNegocio)
    .where('tipo', '==', true) // true = egreso
    .where('fecha', '>=', startDate)
    .where('fecha', '<', nextDate)
    .get();

  let egresos = 0;
  egresosSnap.forEach(doc => {
    const t = doc.data();
    if (t.esGastoFijo === true) return;
    if (t.categoria && ES_GASTO_FIJO_FLAGS.includes(String(t.categoria).toUpperCase())) return;
    egresos += Number(t.monto) || 0;
  });

  return { ingresos, costosVariables, gastosFijos, egresos };
}

// GET /rentabilidad/live/:idNegocio/:year/:month
async function getRentabilidadLive(req, res) {
  try {
    const { idNegocio, year, month } = req.params;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);

    if (!idNegocio || isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ message: 'idNegocio, year y month inválidos' });
    }

    const { ingresos, costosVariables, gastosFijos, egresos } =
      await computeRentabilidadMes(idNegocio, y, m);

    const live = new RentabilidadMensual(
      'LIVE',
      idNegocio,
      y,
      m,
      ingresos,
      costosVariables,
      gastosFijos,
      egresos
    );

    // live.rentabilidadNeta = ingresos − (costosVariables + gastosFijos + egresos)
    return res.status(200).json({ mode: 'live', ...live });
  } catch (error) {
    console.error('Error en getRentabilidadLive:', error);
    return res.status(500).json({ message: 'Error al calcular rentabilidad (live)', error: error.message });
  }
}

module.exports = { createRentabilidadMensual, getRentabilidadLive };
