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

module.exports = { getTransaccionesByNegocio };


module.exports = { createTransaccion, getTransaccionesByNegocio };