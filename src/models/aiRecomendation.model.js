class RecomendacionIA {
  constructor(idRecomendacion, idNegocio, tipo, mensaje) {
    this.idRecomendacion = idRecomendacion;
    this.idNegocio = idNegocio; // referencia al Business
    this.tipo = tipo; // ejemplo: "rentabilidad", "costos"
    this.mensaje = mensaje;
    this.fechaGeneracion = new Date();
  }
}

module.exports = RecomendacionIA;
