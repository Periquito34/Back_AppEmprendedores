const { db } = require('../config/firebase');

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// tipo: false = ingreso, true = egreso. Datos antiguos lo guardan como numero o texto.
function esEgreso(tipo) {
  return tipo === true || tipo === 1 || tipo === 'expense' || tipo === 'egreso';
}

function esIngreso(tipo) {
  return tipo === false || tipo === 0 || tipo === 'income' || tipo === 'ingreso';
}

// Misma formula que el balance local del frontend:
// capitalInicial + ventas + ingresos - egresos - gastos fijos pagados
function calcularBalanceGeneral({ capitalInicial, ventas = [], transacciones = [], gastosFijosPagados = [] }) {
  const totalVentas = ventas.reduce((sum, v) => sum + toNumber(v.totalVenta), 0);
  const transaccionesIngreso = transacciones
    .filter((t) => esIngreso(t.tipo))
    .reduce((sum, t) => sum + toNumber(t.monto), 0);
  const transaccionesEgreso = transacciones
    .filter((t) => esEgreso(t.tipo))
    .reduce((sum, t) => sum + toNumber(t.monto), 0);
  const totalGastosFijosPagados = gastosFijosPagados.reduce((sum, g) => sum + toNumber(g.costoGasto), 0);
  const capital = toNumber(capitalInicial);

  return {
    capitalInicial: capital,
    ventas: totalVentas,
    transaccionesIngreso,
    transaccionesEgreso,
    gastosFijosPagados: totalGastosFijosPagados,
    balanceTotal: capital + totalVentas + transaccionesIngreso - transaccionesEgreso - totalGastosFijosPagados
  };
}

// Ventas del negocio. Las ventas antiguas no tienen idNegocio, asi que tambien
// se buscan por los productos del negocio (deduplicando por id de documento).
async function obtenerVentasDelNegocio(idNegocio) {
  const [ventasSnap, productosSnap] = await Promise.all([
    db.collection('ventas').where('idNegocio', '==', idNegocio).get(),
    db.collection('products').where('idNegocio', '==', idNegocio).get()
  ]);

  const ventas = new Map(ventasSnap.docs.map((doc) => [doc.id, doc.data()]));

  const idsProductos = productosSnap.docs.map((doc) => doc.id);
  for (let i = 0; i < idsProductos.length; i += 30) { // limite de Firestore para 'in'
    const snap = await db.collection('ventas')
      .where('idProducto', 'in', idsProductos.slice(i, i + 30))
      .get();
    snap.docs.forEach((doc) => ventas.set(doc.id, doc.data()));
  }

  return [...ventas.values()];
}

async function obtenerBalanceGeneralService(idNegocio, capitalInicial) {
  const [ventas, transaccionesSnap, gastosSnap] = await Promise.all([
    obtenerVentasDelNegocio(idNegocio),
    db.collection('transacciones').where('idNegocio', '==', idNegocio).get(),
    db.collection('gastosFijosPagados').where('idNegocio', '==', idNegocio).get()
  ]);

  return calcularBalanceGeneral({
    capitalInicial,
    ventas,
    transacciones: transaccionesSnap.docs.map((doc) => doc.data()),
    gastosFijosPagados: gastosSnap.docs.map((doc) => doc.data())
  });
}

module.exports = { calcularBalanceGeneral, obtenerBalanceGeneralService };
