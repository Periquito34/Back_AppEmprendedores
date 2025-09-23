class ProductoVendido {
  constructor(idVenta, idNegocio, idProducto, cantidadVendida, precioUnitario, costoProduccion) {
    this.idVenta = idVenta;
    this.idNegocio = idNegocio;   // referencia al Business
    this.idProducto = idProducto; // referencia al Product
    this.cantidadVendida = cantidadVendida;
    this.precioUnitario = precioUnitario;

    // 👇 Costo por unidad
    this.costoProduccion = costoProduccion;

    // Totales derivados
    this.totalVenta = cantidadVendida * precioUnitario;
    this.totalCostoProduccion = cantidadVendida * costoProduccion;

    // Útil para reportes
    this.utilidad = this.totalVenta - this.totalCostoProduccion;

    this.fechaVenta = new Date();
  }
}

module.exports = ProductoVendido;
