const admin = require('firebase-admin');
const Transaccion = require('../models/transaction.model');

// Helper para normalizar el tipo recibido (0/1/true/false/"ingreso"/"egreso")
function normalizarTipo(tipo) {
  // Permitir varias formas de entrada, pero mapear a booleano final
  if (tipo === 1 || tipo === '1' || tipo === true || tipo === 'true' || tipo === 'egreso') {
    return true;  // egreso
  }
  if (tipo === 0 || tipo === '0' || tipo === false || tipo === 'false' || tipo === 'ingreso') {
    return false; // ingreso
  }
  // Si viene algo inesperado, devolvemos null para disparar 400
  return null;
}

async function createTransaccion(req, res) {
  try {
    const { idNegocio, tipo, monto, descripcion } = req.body;

    // Validaciones mínimas
    if (!idNegocio) {
      return res.status(400).json({ message: 'idNegocio es requerido' });
    }

    const tipoBool = normalizarTipo(tipo);
    if (tipoBool === null) {
      return res.status(400).json({
        message: 'tipo inválido. Usa 0 (ingreso) o 1 (egreso). También se aceptan "ingreso"/"egreso", true/false.'
      });
    }

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      return res.status(400).json({ message: 'monto debe ser un número mayor a 0' });
    }

    const idTransaccion = admin.firestore().collection('transacciones').doc().id;

    // IMPORTANTE: Pasamos un valor que el modelo convertirá a booleano correctamente
    // Nuestro modelo usa Boolean(tipo) en el constructor, así que le pasamos 1/0 coherente con tipoBool.
    const tipoNumericoParaModelo = tipoBool ? 1 : 0;

    const newTransaccion = new Transaccion(
      idTransaccion,
      idNegocio,
      tipoNumericoParaModelo, // el modelo hará Boolean(1/0) => true/false
      montoNum,
      descripcion ?? ''
    );

    // Guardamos tipo como booleano en Firestore
    await admin.firestore().collection('transacciones').doc(idTransaccion).set({
      idNegocio: newTransaccion.idNegocio,
      tipo: newTransaccion.tipo, // booleano (false=ingreso, true=egreso)
      monto: newTransaccion.monto,
      descripcion: newTransaccion.descripcion,
      fecha: newTransaccion.fecha,
      // Opcional: campo legible (si tu modelo tiene getTipoString)
      tipoString: typeof newTransaccion.getTipoString === 'function'
        ? newTransaccion.getTipoString()
        : (newTransaccion.tipo ? 'egreso' : 'ingreso')
    });

    return res.status(201).json({
      message: 'Transacción registrada con éxito',
      data: newTransaccion
    });
  } catch (error) {
    console.error('Error al registrar transacción:', error);
    return res.status(500).json({
      message: 'Error al registrar transacción',
      error: error.message
    });
  }
}

// controllers/transacciones.js
// const admin = require('firebase-admin');

async function getTransaccionesByNegocio(req, res) {
  try {
    const { idNegocio } = req.params; // Ruta: /negocios/:idNegocio/transacciones
    if (!idNegocio) {
      return res.status(400).json({ message: 'idNegocio es requerido en la ruta' });
    }

    const snap = await admin.firestore()
      .collection('transacciones')
      .where('idNegocio', '==', idNegocio)
      .get();

    const data = snap.docs.map((doc) => {
      const d = doc.data();
      // Normaliza fecha a ISO si viene como Timestamp
      const fecha = d.fecha?.toDate ? d.fecha.toDate() : d.fecha;
      return {
        idTransaccion: doc.id,
        idNegocio: d.idNegocio,
        tipo: d.tipo, // booleano: false=ingreso, true=egreso
        monto: d.monto,
        descripcion: d.descripcion ?? '',
        fecha: fecha ?? null,
        fechaISO: fecha instanceof Date ? fecha.toISOString() : null,
      };
    });

    return res.json({
      message: 'Transacciones obtenidas con éxito',
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return res.status(500).json({
      message: 'Error al obtener transacciones',
      error: error.message,
    });
  }
}

// controllers/transacciones.js
// const admin = require('firebase-admin');

async function getEgresosByMonth(req, res) {
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

    // Rango de fechas del mes (local server time)
    const startDate = new Date(yearInt, monthInt - 1, 1, 0, 0, 0, 0);
    const endDate   = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);

    // Consulta: solo EGRESOS (tipo = true) del negocio en ese mes
    const snap = await admin.firestore()
      .collection('transacciones')
      .where('idNegocio', '==', idNegocio)
      .where('tipo', '==', true) // true = egreso
      .where('fecha', '>=', startDate)
      .where('fecha', '<=', endDate)
      .get();

    // Sumatoria
    let totalEgresos = 0;
    const transacciones = snap.docs.map(doc => {
      const d = doc.data();
      const monto = Number(d.monto) || 0;
      totalEgresos += monto;

      const fecha = d.fecha?.toDate ? d.fecha.toDate() : d.fecha;
      return {
        idTransaccion: doc.id,
        monto,
        descripcion: d.descripcion ?? '',
        fecha: fecha ?? null,
        fechaISO: fecha instanceof Date ? fecha.toISOString() : null
      };
    });

    return res.status(200).json({
      message: `Total de egresos del negocio ${idNegocio} en ${monthInt}/${yearInt}`,
      idNegocio,
      year: yearInt,
      month: monthInt,
      totalEgresos,
      count: transacciones.length,
      data: transacciones // si no quieres el detalle, quítalo
    });

  } catch (error) {
    console.error('Error al obtener egresos por mes:', error);
    return res.status(500).json({
      message: 'Error al obtener egresos por mes',
      error: error.message
    });
  }
}

// Suma de egresos por mes (versión corta)
async function getEgresosByMonthShort(req, res) {
  try {
    const { idNegocio, year, month } = req.params;
    if (!idNegocio || !year || !month) {
      return res.status(400).json({ message: 'idNegocio, year y month son requeridos' });
    }

    const y = Number(year);
    const m = Number(month);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // [start, next) → evita problemas de 23:59:59.999
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const next  = new Date(y, m, 1, 0, 0, 0, 0);

    const snap = await admin.firestore()
      .collection('transacciones')
      .where('idNegocio', '==', idNegocio)
      .where('tipo', '==', true)        // true = egreso
      .where('fecha', '>=', start)
      .where('fecha', '<', next)
      .get();

    let totalEgresos = 0;
    snap.forEach(doc => totalEgresos += (Number(doc.get('monto')) || 0));

    return res.status(200).json({
      idNegocio,
      year: y,
      month: m,
      totalEgresos,
      count: snap.size
    });
  } catch (error) {
    console.error('Error al obtener egresos por mes:', error);
    return res.status(500).json({ message: 'Error al obtener egresos por mes', error: error.message });
  }
}

module.exports = { createTransaccion, getTransaccionesByNegocio, getEgresosByMonth, getEgresosByMonthShort };