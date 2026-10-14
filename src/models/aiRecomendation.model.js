const ESTADOS_RECOMENDACION = ['pendiente', 'aplicada', 'descartada'];
const PRIORIDADES_RECOMENDACION = ['alta', 'media', 'baja'];

class RecomendacionIA {
  constructor(idRecomendacion, idNegocio, tipo, mensaje, { titulo = '', prioridad = 'media', impacto = '' } = {}) {
    this.idRecomendacion = idRecomendacion;
    this.idNegocio = idNegocio; // referencia al Business
    this.tipo = tipo; // ejemplo: "rentabilidad", "costos", "precios", "inventario", "ventas"
    this.titulo = titulo;
    this.mensaje = mensaje;
    this.prioridad = PRIORIDADES_RECOMENDACION.includes(prioridad) ? prioridad : 'media';
    this.impacto = impacto;
    this.estado = 'pendiente';
    this.fechaGeneracion = new Date();
  }
}

module.exports = RecomendacionIA;
module.exports.ESTADOS_RECOMENDACION = ESTADOS_RECOMENDACION;
module.exports.PRIORIDADES_RECOMENDACION = PRIORIDADES_RECOMENDACION;
