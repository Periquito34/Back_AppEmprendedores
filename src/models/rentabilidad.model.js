// models/RentabilidadMensual.js
class RentabilidadMensual {
  constructor(idResumen, idNegocio, year, month, ingresos, costosVariables, gastosFijos, egresos) {
    this.idResumen = idResumen;   // ID único del documento en Firestore
    this.idNegocio = idNegocio;   // Negocio al que pertenece
    this.year = year;             // Año del resumen
    this.month = month;           // Mes del resumen (1-12)

    // Datos calculados
    this.ingresos = ingresos;                 // Total ventas del mes
    this.costosVariables = costosVariables;   // Total costos de producción
    this.gastosFijos = gastosFijos;           // Total gastos fijos
    this.egresos = egresos;                   // Total egresos (transacciones tipo true)

    // Fórmula: Ingresos - (Costos Variables + Gastos Fijos + Egresos)
    this.rentabilidadNeta = ingresos - (costosVariables + gastosFijos + egresos);

    this.createdAt = new Date(); // fecha de creación del resumen
  }
}

module.exports = RentabilidadMensual;
