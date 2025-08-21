class Business {
  constructor(idNegocio, uid, nombreNegocio, sector, capitalInicial) {
    this.idNegocio = idNegocio;
    this.uid = uid; // referencia al User
    this.nombreNegocio = nombreNegocio;
    this.descripcion = descripcion;
    this.sector = sector;
    this.capitalInicial = capitalInicial;
    this.fechaCreacion = new Date();
  }
}

module.exports = Business;
