class Product {
  constructor(idProducto, idNegocio, nombreProducto, precioVenta, costoProduccion, stock) {
    this.idProducto = idProducto;
    this.idNegocio = idNegocio; // referencia al Business
    this.nombreProducto = nombreProducto;
    this.precioVenta = precioVenta;
    this.costoProduccion = costoProduccion;
    this.stock = stock;
  }
}

module.exports = Product;
