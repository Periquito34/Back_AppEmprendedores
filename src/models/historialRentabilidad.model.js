class HistorialRentabilidad {
  constructor(idHistorial, idNegocio, rentabilidadEsperada, rentabilidadReal, periodo) {
    this.idHistorial = idHistorial;
    this.idNegocio = idNegocio; // referencia al Business
    this.rentabilidadEsperada = rentabilidadEsperada;
    this.rentabilidadReal = rentabilidadReal;
    this.periodo = periodo; // ejemplo: "Agosto 2025"
  }
}

module.exports = HistorialRentabilidad;
