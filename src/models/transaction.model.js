class Transaccion {
  constructor(idTransaccion, idNegocio, tipo, monto, descripcion) {
    this.idTransaccion = idTransaccion;
    this.idNegocio = idNegocio; // referencia al Business
    this.tipo = tipo; // "ingreso" o "egreso"
    this.monto = monto;
    this.descripcion = descripcion;
    this.fecha = new Date();
  }
}

module.exports = Transaccion;
