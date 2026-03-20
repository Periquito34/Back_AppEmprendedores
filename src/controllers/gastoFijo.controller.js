const admin = require('firebase-admin');
const GastosFijos = require('../models/gastoFijo.model');

/*
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
*/

async function createGastoFijo(req, res) {
  try {
    const {
      idNegocio,
      nombreGasto,
      costoGasto,
      descripcion,
      recurrencia,
      fechasEjecucion,
      pagado = false
    } = req.body;

    // Generar un ID único para el gasto
    const idGasto = admin.firestore().collection('gastosFijos').doc().id;

    // Definir la próxima fecha de reset
    const proximaFechaReset = Array.isArray(fechasEjecucion)
      ? fechasEjecucion[0]
      : fechasEjecucion;

    // Crear la instancia del modelo
    const newGastoFijo = new GastosFijos(
      idGasto,
      idNegocio,
      nombreGasto,
      costoGasto,
      descripcion,
      recurrencia,
      fechasEjecucion,
      proximaFechaReset,
      pagado
    );

    // Guardar en Firestore
    await admin.firestore().collection('gastosFijos').doc(idGasto).set({
      idGasto: newGastoFijo.idGasto,
      idNegocio: newGastoFijo.idNegocio,
      nombreGasto: newGastoFijo.nombreGasto,
      costoGasto: newGastoFijo.costoGasto,
      descripcion: newGastoFijo.descripcion,
      recurrencia: newGastoFijo.recurrencia,
      fechasEjecucion: newGastoFijo.fechasEjecucion,
      proximaFechaReset: newGastoFijo.proximaFechaReset,
      pagado: newGastoFijo.pagado,
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


// Obtener gastos fijos por negocio (sumando costoGasto)
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

    let totalCostos = 0;
    let totalPagados = 0;
    let totalNoPagados = 0;
    let countPagados = 0;
    let countNoPagados = 0;

    const gastos = snapshot.docs.map((doc) => {
      const data = doc.data();

      // 👇 Usamos SOLAMENTE costoGasto para las sumas
      const costo = Number(data.costoGasto) || 0;
      const pagado = Boolean(data.pagado);

      totalCostos += costo;
      if (pagado) {
        totalPagados += costo;
        countPagados += 1;
      } else {
        totalNoPagados += costo;
        countNoPagados += 1;
      }

      // Normaliza fecha si necesitas
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;

      return {
        idGasto: doc.id,
        ...data,
        costoGasto: costo,                      // aseguramos número
        pagado,                                 // booleano normalizado
        createdAt,
        createdAtISO: createdAt instanceof Date ? createdAt.toISOString() : createdAt ?? null,
      };
    });

    return res.status(200).json({
      message: `Gastos fijos del negocio ${idNegocio}`,
      totals: {
        totalGastos: totalCostos,               // suma de costoGasto (todos)
        totalPagados,                           // suma de costoGasto (pagados)
        totalNoPagados                          // suma de costoGasto (no pagados)
      },
      counts: {
        total: gastos.length,
        pagados: countPagados,
        noPagados: countNoPagados
      },
      data: gastos
    });

  } catch (error) {
    console.error('Error al obtener gastos fijos:', error);
    return res.status(500).json({
      message: 'Error al obtener gastos fijos',
      error: error.message
    });
  }
}

// Suma de costoGasto para todos los gastos fijos de un negocio
async function getTotalGastosFijosByBusiness(req, res) {
  try {
    const { idNegocio } = req.params;
    if (!idNegocio) {
      return res.status(400).json({ message: 'El idNegocio es requerido' });
    }

    const snap = await admin.firestore()
      .collection('gastosFijos')
      .where('idNegocio', '==', idNegocio)
      .get();

    let totalCostos = 0;
    snap.forEach(doc => {
      const costo = Number(doc.get('costoGasto')) || 0;
      totalCostos += costo;
    });

    return res.status(200).json({
      idNegocio,
      totalCostos,
      count: snap.size
    });
  } catch (error) {
    console.error('Error al sumar gastos fijos:', error);
    return res.status(500).json({
      message: 'Error al sumar gastos fijos',
      error: error.message
    });
  }
}

module.exports = { getTotalGastosFijosByBusiness };


// Obtener gastos fijos pagados en un mes específico (con total de lo pagado)
async function getGastosFijosPagadosByMonth(req, res) {
  try {
    const { idNegocio, year, month } = req.params;

    if (!idNegocio || !year || !month) {
      return res.status(400).json({ message: 'idNegocio, year y month son requeridos' });
    }

    // Parseamos año y mes
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10); // Enero = 1, Febrero = 2 ...

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // Rango de fechas del mes
    const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0, 0);
    const endDate   = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    // Consulta en Firestore
    const snapshot = await admin.firestore()
      .collection('gastosFijos')
      .where('idNegocio', '==', idNegocio)
      .where('pagado', '==', true)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    if (snapshot.empty) {
      // Si prefieres 200 con total=0, cambia este return por el bloque de abajo comentado
      return res.status(404).json({ message: 'No se encontraron gastos pagados en ese mes' });

      /*
      return res.status(200).json({
        message: `Gastos fijos pagados del negocio ${idNegocio} en ${monthInt}/${yearInt}`,
        totalGastosPagados: 0,
        count: 0,
        data: []
      });
      */
    }

    let totalGastosPagados = 0;

    const gastos = snapshot.docs.map(doc => {
      const data = doc.data();

      // Soportar distintos nombres de campo para el monto
      const valor = Number(
        data.monto ??
        data.valor ??
        data.precio ??
        data.total ??
        0
      ) || 0;

      totalGastosPagados += valor;

      // Normalizar fecha
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;

      return {
        idGasto: doc.id,
        ...data,
        valor, // monto usado para la suma
        createdAt,
        createdAtISO: createdAt instanceof Date ? createdAt.toISOString() : null
      };
    });

    return res.status(200).json({
      message: `Gastos fijos pagados del negocio ${idNegocio} en ${monthInt}/${yearInt}`,
      totalGastosPagados,
      count: gastos.length,
      data: gastos
    });

  } catch (error) {
    console.error('Error al obtener gastos fijos pagados:', error);
    return res.status(500).json({
      message: 'Error al obtener gastos fijos pagados',
      error: error.message
    });
  }
}


module.exports = { createGastoFijo, markGastoFijoAsPaid, getGastosFijosByBusiness, getGastosFijosPagadosByMonth, getTotalGastosFijosByBusiness };
