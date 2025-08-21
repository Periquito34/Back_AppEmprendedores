class ProductoVendido {
  constructor(idVenta, idProducto, cantidadVendida, precioUnitario) {
    this.idVenta = idVenta;
    this.idProducto = idProducto; // referencia al Product
    this.cantidadVendida = cantidadVendida;
    this.precioUnitario = precioUnitario;
    this.totalVenta = cantidadVendida * precioUnitario;
    this.fechaVenta = new Date();
  }
}

module.exports = ProductoVendido;
