const { admin, db } = require('../config/firebase');
const RentabilidadMensual = require('../models/rentabilidad.model');

async function crearRentabilidadMensualService(idNegocio, year, month) {
  const yearInt = parseInt(year, 10);
  const monthInt = parseInt(month, 10);

  if (!idNegocio || !yearInt || !monthInt) {
    throw new Error('idNegocio, year y month son requeridos');
  }

  if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
    throw new Error('Mes o año inválidos');
  }

  const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

  // 1. Ventas
  const ventasSnap = await db
    .collection('ventas')
    .where('idNegocio', '==', idNegocio)
    .where('fechaVenta', '>=', startDate)
    .where('fechaVenta', '<=', endDate)
    .get();

  let ingresos = 0;
  let costosVariables = 0;

  ventasSnap.forEach((doc) => {
    const v = doc.data();
    ingresos += Number(v.totalVenta) || 0;
    costosVariables += Number(v.totalCostoProduccion) || 0;
  });

  // 2. Gastos fijos
  const gastosFijosSnap = await db
    .collection('gastosFijos')
    .where('idNegocio', '==', idNegocio)
    .get();

  let gastosFijos = 0;
  gastosFijosSnap.forEach((doc) => {
    gastosFijos += Number(doc.get('costoGasto')) || 0;
  });

  // 3. Egresos
  const egresosSnap = await db
    .collection('transacciones')
    .where('idNegocio', '==', idNegocio)
    .where('tipo', '==', true)
    .where('fecha', '>=', startDate)
    .where('fecha', '<=', endDate)
    .get();

  let egresos = 0;
  egresosSnap.forEach((doc) => {
    egresos += Number(doc.get('monto')) || 0;
  });

  // Protección para no duplicar el mismo mes
  const existenteSnap = await db
    .collection('rentabilidadesMensuales')
    .where('idNegocio', '==', idNegocio)
    .where('year', '==', yearInt)
    .where('month', '==', monthInt)
    .limit(1)
    .get();

  if (!existenteSnap.empty) {
    throw new Error(`Ya existe una rentabilidad para ${idNegocio} en ${yearInt}-${monthInt}`);
  }

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

  return newResumen;
}

module.exports = {
  crearRentabilidadMensualService,
};