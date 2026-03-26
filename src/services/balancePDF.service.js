const PDFDocument = require('pdfkit');
const { bucket } = require('../config/firebase');
const { computeRentabilidadMes } = require('../controllers/rentabilidad.controller');

function sumarMontos(items = []) {
  return items.reduce((acc, item) => {
    return acc + (Number(item.monto) || Number(item.totalVenta) || Number(item.valor) || 0);
  }, 0);
}

async function generarYSubirPdfBalance(balanceData) {
  try {
    const {
      idBalance,
      idNegocio,
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
      weeklyMovimientos = []
    } = balanceData;

    const fechaBase = new Date();
    const year = fechaBase.getFullYear();
    const month = fechaBase.getMonth() + 1;

    const {
      ingresos: ingresosMes = 0,
      costosVariables = 0,
      gastosFijos = 0,
      egresos: egresosMes = 0
    } = await computeRentabilidadMes(idNegocio, year, month);

    const rentabilidadNetaMes =
      Number(ingresosMes) - (
        Number(costosVariables) +
        Number(gastosFijos) +
        Number(egresosMes)
      );

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfBufferPromise = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(Number(value) || 0);
    };

    const formatDate = (value) => {
      if (!value) return '-';
      const date = new Date(value);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getMonthName = (yearValue, monthValue) => {
      const date = new Date(yearValue, monthValue - 1, 1);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long'
      });
    };

    const drawDivider = (y) => {
      doc
        .strokeColor('#D1D5DB')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(545, y)
        .stroke();
    };

    const drawSectionTitle = (title, color = '#1F2937') => {
      doc
        .moveDown(0.8)
        .fontSize(14)
        .fillColor(color)
        .font('Helvetica-Bold')
        .text(title, { align: 'left' })
        .moveDown(0.4);

      drawDivider(doc.y);
      doc.moveDown(0.6);
    };

    const drawLabelValue = (label, value, options = {}) => {
      const { valueColor = '#111827', labelColor = '#4B5563' } = options;

      const startY = doc.y;

      doc
        .fontSize(11)
        .fillColor(labelColor)
        .font('Helvetica-Bold')
        .text(`${label}:`, 50, startY, { continued: true });

      doc
        .fillColor(valueColor)
        .font('Helvetica')
        .text(` ${value}`);
    };

    const drawMovementList = (title, items = [], color = '#111827') => {
      drawSectionTitle(title, color);

      if (!items.length) {
        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .font('Helvetica-Oblique')
          .text('No se registraron movimientos en esta sección.');
        return;
      }

      items.slice(0, 8).forEach((item) => {
        const descripcion = item.descripcion || item.tipo || 'Movimiento';
        const monto = formatCurrency(item.monto || item.totalVenta || item.valor || 0);
        const fecha = formatDate(item.fecha);

        doc
          .fontSize(10.5)
          .fillColor('#111827')
          .font('Helvetica-Bold')
          .text(`• ${descripcion}`, { continued: true })
          .font('Helvetica')
          .fillColor('#6B7280')
          .text(`  |  ${fecha}`, { continued: true })
          .fillColor(color)
          .font('Helvetica-Bold')
          .text(`  |  ${monto}`);

        doc.moveDown(0.2);
      });

      if (items.length > 8) {
        doc
          .moveDown(0.2)
          .fontSize(9.5)
          .fillColor('#6B7280')
          .font('Helvetica-Oblique')
          .text(`Se muestran 8 de ${items.length} registros.`);
      }
    };

    // ENCABEZADO
    doc
      .fontSize(22)
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .text('Reporte de Balance Semanal', { align: 'center' });

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .font('Helvetica')
      .text(`Generado el ${formatDate(new Date())}`, { align: 'center' });

    doc.moveDown(1.2);

    // RESUMEN PRINCIPAL
    drawSectionTitle('Resumen general', '#0F172A');

    drawLabelValue('Semana', weekKey);
    drawLabelValue('Periodo', `${formatDate(weekStart)} al ${formatDate(weekEnd)}`);
    drawLabelValue('Balance total', formatCurrency(balanceTotal), {
      valueColor: '#0F766E'
    });

    doc.moveDown(0.8);

    // RENTABILIDAD DEL MES
    drawSectionTitle('Rentabilidad acumulada hasta ahora del mes', '#0F172A');

    drawLabelValue('Periodo de rentabilidad', getMonthName(year, month));
    drawLabelValue('Ingresos del mes', formatCurrency(ingresosMes), {
      valueColor: '#15803D'
    });
    drawLabelValue('Costos variables', formatCurrency(costosVariables), {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Gastos fijos', formatCurrency(gastosFijos), {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Egresos del mes', formatCurrency(egresosMes), {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Rentabilidad neta acumulada', formatCurrency(rentabilidadNetaMes), {
      valueColor: rentabilidadNetaMes >= 0 ? '#15803D' : '#B91C1C'
    });

    doc.moveDown(0.8);

    // COMPONENTES
    drawSectionTitle('Componentes del balance', '#0F172A');

    drawLabelValue('Capital inicial', formatCurrency(components.capitalInicial || 0));
    drawLabelValue('Ventas', formatCurrency(components.ventas || 0), {
      valueColor: '#15803D'
    });
    drawLabelValue('Transacciones de ingreso', formatCurrency(components.transaccionesIngreso || 0), {
      valueColor: '#15803D'
    });
    drawLabelValue('Transacciones de egreso', formatCurrency(components.transaccionesEgreso || 0), {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Gastos fijos pagados', formatCurrency(components.gastosFijosPagados || 0), {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Ajustes', formatCurrency(components.ajustes || 0));
    drawLabelValue('Última actualización', formatDate(components.updatedAt || components.lastMovementAt));

    doc.moveDown(0.8);

    // RESUMEN DE REGISTROS
    drawSectionTitle('Resumen de registros', '#0F172A');

    drawLabelValue('Cantidad de ingresos', ingresos.length, {
      valueColor: '#15803D'
    });
    drawLabelValue('Cantidad de egresos', egresos.length, {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Cantidad de movimientos', movimientos.length);
    drawLabelValue('Weekly ingresos', weeklyIngresos.length, {
      valueColor: '#15803D'
    });
    drawLabelValue('Weekly egresos', weeklyEgresos.length, {
      valueColor: '#B91C1C'
    });
    drawLabelValue('Weekly movimientos', weeklyMovimientos.length);

    doc.moveDown(0.8);

    // TOTALES
    drawSectionTitle('Totales semanales', '#0F172A');

    drawLabelValue('Total weekly ingresos', formatCurrency(sumarMontos(weeklyIngresos)), {
      valueColor: '#15803D'
    });
    drawLabelValue('Total weekly egresos', formatCurrency(sumarMontos(weeklyEgresos)), {
      valueColor: '#B91C1C'
    });

    doc.moveDown(1);

    // DETALLES
    drawMovementList('Detalle de ingresos', ingresos, '#0F172A');
    doc.moveDown(0.6);
    drawMovementList('Detalle de egresos', egresos, '#0F172A');
    doc.moveDown(0.6);
    drawMovementList('Detalle de movimientos semanales', weeklyMovimientos, '#0F172A');

    // PIE
    doc.moveDown(1.5);
    drawDivider(doc.y);
    doc.moveDown(0.5);

    doc
      .fontSize(9)
      .fillColor('#6B7280')
      .font('Helvetica')
      .text(
        'Este documento resume el comportamiento financiero semanal del negocio y muestra adicionalmente la rentabilidad acumulada del mes en curso.',
        { align: 'center' }
      );

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    const timestamp = Date.now();
    const filePath = `balances/${idNegocio}/${weekKey}-${idBalance}-${timestamp}.pdf`;
    const file = bucket.file(filePath);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        cacheControl: 'no-store'
      }
    });

    await file.makePublic();

    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
      pdfUrl,
      pdfPath: filePath
    };
  } catch (error) {
    throw new Error(`Error al generar y subir PDF: ${error.message}`);
  }
}

module.exports = {
  generarYSubirPdfBalance
};
/*
function sumarMontos(items = []) {
  return items.reduce((acc, item) => {
    return acc + (Number(item.monto) || Number(item.totalVenta) || Number(item.valor) || 0);
  }, 0);
}

async function generarYSubirPdfBalance(balanceData) {
  try {
    const {
      idBalance,
      idNegocio,
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
      weeklyMovimientos = []
    } = balanceData;

const doc = new PDFDocument({ margin: 50 });
const chunks = [];

doc.on('data', (chunk) => chunks.push(chunk));

const pdfBufferPromise = new Promise((resolve, reject) => {
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(Number(value) || 0);
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const drawDivider = (y) => {
  doc
    .strokeColor('#D1D5DB')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(545, y)
    .stroke();
};

const drawSectionTitle = (title, color = '#1F2937') => {
  doc
    .moveDown(0.8)
    .fontSize(14)
    .fillColor(color)
    .font('Helvetica-Bold')
    .text(title, { align: 'left' })
    .moveDown(0.4);

  drawDivider(doc.y);
  doc.moveDown(0.6);
};

const drawLabelValue = (label, value, options = {}) => {
  const { valueColor = '#111827', labelColor = '#4B5563' } = options;

  const startY = doc.y;

  doc
    .fontSize(11)
    .fillColor(labelColor)
    .font('Helvetica-Bold')
    .text(`${label}:`, 50, startY, { continued: true });

  doc
    .fillColor(valueColor)
    .font('Helvetica')
    .text(` ${value}`);
};

const drawMovementList = (title, items = [], color = '#111827') => {
  drawSectionTitle(title, color);

  if (!items.length) {
    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .font('Helvetica-Oblique')
      .text('No se registraron movimientos en esta sección.');
    return;
  }

  items.slice(0, 8).forEach((item) => {
    const descripcion = item.descripcion || item.tipo || 'Movimiento';
    const monto = formatCurrency(item.monto || item.totalVenta || item.valor || 0);
    const fecha = formatDate(item.fecha);

    doc
      .fontSize(10.5)
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .text(`• ${descripcion}`, { continued: true })
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`  |  ${fecha}`, { continued: true })
      .fillColor(color)
      .font('Helvetica-Bold')
      .text(`  |  ${monto}`);

    doc.moveDown(0.2);
  });

  if (items.length > 8) {
    doc
      .moveDown(0.2)
      .fontSize(9.5)
      .fillColor('#6B7280')
      .font('Helvetica-Oblique')
      .text(`Se muestran 8 de ${items.length} registros.`);
  }
};

// ENCABEZADO
doc
  .fontSize(22)
  .fillColor('#111827')
  .font('Helvetica-Bold')
  .text('Reporte de Balance Semanal', { align: 'center' });

doc.moveDown(0.3);

doc
  .fontSize(10)
  .fillColor('#6B7280')
  .font('Helvetica')
  .text(`Generado el ${formatDate(new Date())}`, { align: 'center' });

doc.moveDown(1.2);

// RESUMEN PRINCIPAL
drawSectionTitle('Resumen general', '#0F172A');

drawLabelValue('Negocio', idNegocio);
drawLabelValue('Semana', weekKey);
drawLabelValue('Periodo', `${formatDate(weekStart)} al ${formatDate(weekEnd)}`);
drawLabelValue('Balance total', formatCurrency(balanceTotal), {
  valueColor: '#0F766E'
});

doc.moveDown(0.8);

// COMPONENTES
drawSectionTitle('Componentes del balance', '#1D4ED8');

drawLabelValue('Capital inicial', formatCurrency(components.capitalInicial || 0));
drawLabelValue('Ventas', formatCurrency(components.ventas || 0), {
  valueColor: '#15803D'
});
drawLabelValue('Transacciones de ingreso', formatCurrency(components.transaccionesIngreso || 0), {
  valueColor: '#15803D'
});
drawLabelValue('Transacciones de egreso', formatCurrency(components.transaccionesEgreso || 0), {
  valueColor: '#B91C1C'
});
drawLabelValue('Gastos fijos pagados', formatCurrency(components.gastosFijosPagados || 0), {
  valueColor: '#B91C1C'
});
drawLabelValue('Ajustes', formatCurrency(components.ajustes || 0));
drawLabelValue('Última actualización', formatDate(components.updatedAt || components.lastMovementAt));

doc.moveDown(0.8);

// RESUMEN DE REGISTROS
drawSectionTitle('Resumen de registros', '#7C3AED');

drawLabelValue('Cantidad de ingresos', ingresos.length, {
  valueColor: '#15803D'
});
drawLabelValue('Cantidad de egresos', egresos.length, {
  valueColor: '#B91C1C'
});
drawLabelValue('Cantidad de movimientos', movimientos.length);
drawLabelValue('Weekly ingresos', weeklyIngresos.length, {
  valueColor: '#15803D'
});
drawLabelValue('Weekly egresos', weeklyEgresos.length, {
  valueColor: '#B91C1C'
});
drawLabelValue('Weekly movimientos', weeklyMovimientos.length);

doc.moveDown(0.8);

// TOTALES
drawSectionTitle('Totales semanales', '#EA580C');

drawLabelValue('Total weekly ingresos', formatCurrency(sumarMontos(weeklyIngresos)), {
  valueColor: '#15803D'
});
drawLabelValue('Total weekly egresos', formatCurrency(sumarMontos(weeklyEgresos)), {
  valueColor: '#B91C1C'
});

doc.moveDown(1);

// DETALLES
drawMovementList('Detalle de ingresos', ingresos, '#15803D');
doc.moveDown(0.6);
drawMovementList('Detalle de egresos', egresos, '#B91C1C');
doc.moveDown(0.6);
drawMovementList('Detalle de movimientos semanales', weeklyMovimientos, '#1F2937');

// PIE
doc.moveDown(1.5);
drawDivider(doc.y);
doc.moveDown(0.5);

doc
  .fontSize(9)
  .fillColor('#6B7280')
  .font('Helvetica')
  .text(
    'Este documento resume el comportamiento financiero semanal del negocio con base en los movimientos registrados en la plataforma.',
    { align: 'center' }
  );

doc.end();
    const pdfBuffer = await pdfBufferPromise;

    const timestamp = Date.now();
const filePath = `balances/${idNegocio}/${weekKey}-${idBalance}-${timestamp}.pdf`;
const file = bucket.file(filePath);

await file.save(pdfBuffer, {
  metadata: {
    contentType: 'application/pdf',
    cacheControl: 'no-store'
  }
});

    await file.makePublic();

    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
      pdfUrl,
      pdfPath: filePath
    };
  } catch (error) {
    throw new Error(`Error al generar y subir PDF: ${error.message}`);
  }
}

module.exports = {
  generarYSubirPdfBalance
};
*/