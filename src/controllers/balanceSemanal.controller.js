const admin = require('firebase-admin');
const BalanceSemanal = require('../models/balanceSemanal.model');

async function createBalanceSemanal(req, res) {
  try {
    const {
      idNegocio,
      uid,
      source,
      weekKey,
      weekStart,
      weekEnd,
      balanceTotal,
      components = {},
      ingresos = [],
      egresos = [],
      movimientos = [],
      weeklyIngresos = [],
      weeklyEgresos = [],
      weeklyMovimientos = [],
      generatedAt
    } = req.body;

    if (!idNegocio) {
      return res.status(400).json({
        message: 'idNegocio es requerido'
      });
    }

    if (!weekKey) {
      return res.status(400).json({
        message: 'weekKey es requerido'
      });
    }

    const idBalance = admin.firestore().collection('balancesSemanales').doc().id;

    const newBalanceSemanal = new BalanceSemanal(
      idBalance,
      idNegocio,
      uid,
      source,
      weekKey,
      weekStart,
      weekEnd,
      balanceTotal,
      components,
      ingresos,
      egresos,
      movimientos,
      weeklyIngresos,
      weeklyEgresos,
      weeklyMovimientos,
      generatedAt ? new Date(generatedAt) : new Date()
    );

    await admin.firestore().collection('balancesSemanales').doc(idBalance).set({
      idBalance: newBalanceSemanal.idBalance,
      idNegocio: newBalanceSemanal.idNegocio,
      uid: newBalanceSemanal.uid,
      source: newBalanceSemanal.source,
      weekKey: newBalanceSemanal.weekKey,
      weekStart: newBalanceSemanal.weekStart,
      weekEnd: newBalanceSemanal.weekEnd,
      balanceTotal: newBalanceSemanal.balanceTotal,
      components: newBalanceSemanal.components,
      ingresos: newBalanceSemanal.ingresos,
      egresos: newBalanceSemanal.egresos,
      movimientos: newBalanceSemanal.movimientos,
      weeklyIngresos: newBalanceSemanal.weeklyIngresos,
      weeklyEgresos: newBalanceSemanal.weeklyEgresos,
      weeklyMovimientos: newBalanceSemanal.weeklyMovimientos,
      generatedAt: newBalanceSemanal.generatedAt,
      createdAt: newBalanceSemanal.createdAt
    });

    return res.status(201).json({
      message: 'Balance semanal guardado con éxito',
      data: newBalanceSemanal
    });
  } catch (error) {
    console.error('Error al guardar balance semanal:', error);
    return res.status(500).json({
      message: 'Error al guardar balance semanal',
      error: error.message
    });
  }
}

async function getAllBalancesSemanales(req, res) {
  try {
    const snapshot = await admin.firestore()
      .collection('balancesSemanales')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay balances registrados',
        data: []
      });
    }

    const balances = [];

    snapshot.forEach(doc => {
      balances.push(doc.data());
    });

    return res.status(200).json({
      message: 'Balances obtenidos con éxito',
      total: balances.length,
      data: balances
    });

  } catch (error) {
    console.error('Error al obtener balances:', error);
    return res.status(500).json({
      message: 'Error al obtener balances',
      error: error.message
    });
  }
}

async function getBalancesByNegocio(req, res) {
  try {
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({
        message: 'idNegocio es requerido'
      });
    }

    const snapshot = await admin.firestore()
      .collection('balancesSemanales')
      .where('idNegocio', '==', idNegocio)
      .orderBy('weekStart', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay balances para este negocio',
        data: []
      });
    }

    const balances = [];

    snapshot.forEach(doc => {
      balances.push(doc.data());
    });

    return res.status(200).json({
      message: 'Balances del negocio obtenidos',
      total: balances.length,
      data: balances
    });

  } catch (error) {
    console.error('Error al obtener balances por negocio:', error);
    return res.status(500).json({
      message: 'Error al obtener balances',
      error: error.message
    });
  }
}


module.exports = {
  createBalanceSemanal,
  getAllBalancesSemanales,
  getBalancesByNegocio,
};
