const admin = require('firebase-admin');
const GastosFijos = require('../models/gastoFijo.model');

async function createGastoFijo(req, res) {
  try {
    const { idNegocio, nombreGasto, costoGasto, descripcion, recurrencia, fechasEjecucion, pagado = false } = req.body;

    // Generar un ID único para el gasto
    const idGasto = admin.firestore().collection('gastosFijos').doc().id;

    // Crear la instancia de tu modelo
    const newGastoFijo = new GastosFijos(
      idGasto,
      idNegocio,
      nombreGasto,
      costoGasto,
      descripcion,
      recurrencia,
      fechasEjecucion,
      pagado
    );

    // Guardar en Firestore
    await admin.firestore().collection('gastosFijos').doc(idGasto).set({
      idNegocio: newGastoFijo.idNegocio,
      nombreGasto: newGastoFijo.nombreGasto,
      costoGasto: newGastoFijo.costoGasto,
      descripcion: newGastoFijo.descripcion,
      recurrencia: newGastoFijo.recurrencia,
      fechasEjecucion: newGastoFijo.fechasEjecucion,
      pagado: newGastoFijo.pagado, // 🔹 guardamos el estado
      createdAt: newGastoFijo.createdAt
    });

    return res.status(201).json({
      message: 'Gasto fijo creado con éxito',
      data: newGastoFijo
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear gasto fijo',
      error: error.message
    });
  }
}


// Marcar un gasto fijo como pagado
async function markGastoFijoAsPaid(req, res) {
  try {
    const { idGasto } = req.params;

    if (!idGasto) {
      return res.status(400).json({ message: 'El idGasto es requerido' });
    }

    const gastoRef = admin.firestore().collection('gastosFijos').doc(idGasto);
    const gastoDoc = await gastoRef.get();

    if (!gastoDoc.exists) {
      return res.status(404).json({ message: 'Gasto fijo no encontrado' });
    }

    // Actualizamos el campo "pagado" a true
    await gastoRef.update({ pagado: true });

    return res.status(200).json({
      message: `El gasto fijo con id ${idGasto} fue marcado como pagado`,
      data: { idGasto, pagado: true }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar estado del gasto fijo',
      error: error.message
    });
  }
}

// Obtener gastos fijos por negocio
async function getGastosFijosByBusiness(req, res) {
  try {
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({ message: 'El idNegocio es requerido' });
    }

    const snapshot = await admin.firestore()
      .collection('gastosFijos')
      .where('idNegocio', '==', idNegocio)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron gastos fijos para este negocio' });
    }

    const gastos = snapshot.docs.map(doc => ({
      idGasto: doc.id,
      ...doc.data()
    })); 

    return res.status(200).json({
      message: `Gastos fijos del negocio ${idNegocio}`,
      data: gastos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener gastos fijos',
      error: error.message
    });
  }
}

// Obtener gastos fijos pagados en un mes específico
async function getGastosFijosPagadosByMonth(req, res) {
  try {
    const { idNegocio, year, month } = req.params;

    if (!idNegocio || !year || !month) {
      return res.status(400).json({ message: 'idNegocio, year y month son requeridos' });
    }

    // Parseamos año y mes a enteros
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10); // Enero = 1, Febrero = 2 ...

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // Primer día del mes
    const startDate = new Date(yearInt, monthInt - 1, 1);
    // Último día del mes (0 devuelve el último día del mes anterior)
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59);

    // Consulta en Firestore
    const snapshot = await admin.firestore()
      .collection('gastosFijos')
      .where('idNegocio', '==', idNegocio)
      .where('pagado', '==', true)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron gastos pagados en ese mes' });
    }

    const gastos = snapshot.docs.map(doc => ({
      idGasto: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      message: `Gastos fijos pagados del negocio ${idNegocio} en ${month}/${year}`,
      data: gastos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener gastos fijos pagados',
      error: error.message
    });
  }
}

module.exports = { createGastoFijo, markGastoFijoAsPaid, getGastosFijosByBusiness, getGastosFijosPagadosByMonth };
