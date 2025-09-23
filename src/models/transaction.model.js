class Transaccion {
  constructor(idTransaccion, idNegocio, tipo, monto, descripcion) {
    this.idTransaccion = idTransaccion;
    this.idNegocio = idNegocio; // referencia al Business
    
    // convertir tipo numérico a booleano
    this.tipo = Boolean(tipo); 
    // false = ingreso, true = egreso

    this.monto = monto;
    this.descripcion = descripcion;
    this.fecha = new Date();
  }

  // Método de ayuda para obtener string legible
  getTipoString() {
    return this.tipo ? "egreso" : "ingreso";
  }
}

module.exports = Transaccion;
