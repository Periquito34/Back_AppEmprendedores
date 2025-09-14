class GastosFijos {
  constructor(idGasto, idNegocio, nombreGasto, costoGasto, descripcion, recurrencia, fechasEjecucion, pagado = false) {
    this.idGasto = idGasto;
    this.idNegocio = idNegocio; // referencia al Business
    this.nombreGasto = nombreGasto;
    this.costoGasto = costoGasto;
    this.descripcion = descripcion;
    this.recurrencia = recurrencia; // "mensual", "semanal", "anual", etc.
    this.fechasEjecucion = fechasEjecucion; // puede ser array de fechas o una sola
    this.pagado = pagado; // 🔹 estado: false por defecto
    this.createdAt = new Date();
  }
}

module.exports = GastosFijos;
