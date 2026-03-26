class BalanceSemanal {
  constructor(
    idBalance,
    idNegocio,
    uid,
    source,
    weekKey,
    weekStart,
    weekEnd,
    balanceTotal,
    components = {},
    ingresos = [],
    egresos = [],
    movimientos = [],
    weeklyIngresos = [],
    weeklyEgresos = [],
    weeklyMovimientos = [],
    generatedAt = new Date()
  ) {
    this.idBalance = idBalance;
    this.idNegocio = idNegocio;
    this.uid = uid;
    this.source = source;
    this.weekKey = weekKey;
    this.weekStart = weekStart;
    this.weekEnd = weekEnd;
    this.balanceTotal = balanceTotal;
    this.components = {
      ajustes: components.ajustes || 0,
      balanceTotal: components.balanceTotal || 0,
      capitalInicial: components.capitalInicial || 0,
      gastosFijosPagados: components.gastosFijosPagados || 0,
      lastMovementAt: components.lastMovementAt || null,
      transaccionesEgreso: components.transaccionesEgreso || 0,
      transaccionesIngreso: components.transaccionesIngreso || 0,
      ventas: components.ventas || 0,
      updatedAt: components.updatedAt || null,
      version: components.version || 1
    };
    this.ingresos = ingresos;
    this.egresos = egresos;
    this.movimientos = movimientos;
    this.weeklyIngresos = weeklyIngresos;
    this.weeklyEgresos = weeklyEgresos;
    this.weeklyMovimientos = weeklyMovimientos;
    this.generatedAt = generatedAt;
    this.createdAt = new Date();
  }
}

module.exports = BalanceSemanal;