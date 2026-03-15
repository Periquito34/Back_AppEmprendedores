class GastosFijosPagados {
  constructor(idGasto, idNegocio, nombreGasto, costoGasto, descripcion, recurrencia, fechasEjecucion, pagado = false) {
    this.idGasto = idGasto;
    this.idNegocio = idNegocio; // referencia al Business
    this.nombreGasto = nombreGasto;
    this.costoGasto = costoGasto; 
    this.createdAt = new Date();
  }
}

module.exports = GastosFijosPagados;
