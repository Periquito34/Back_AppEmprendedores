require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { iniciarJobRentabilidad } = require('./jobs/rentabilidad.job');
const { iniciarJobGastosFijos } = require('./jobs/gastosFIjos.job');
const userRoutes = require('./routes/user.routes');
const BusinessRoutes = require('./routes/business.routes');
const aiRecomendationRoutes= require('./routes/aiRecomendation.routes');
const historialRentabilidadRoutes = require('./routes/historialRentabilidad.routes');
const productSoldRoutes = require('./routes/productSold.routes');
const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const gastoFijoRoutes = require('./routes/gastoFijo.routes');
const rentabilidadRoutes = require('./routes/rentabilidad.routes');
const gastoFijoPagadoRoutes = require('./routes/gastoFijoPagado.routes');
const balanceSemanalRoutes = require('./routes/balanceSemanal.routes');
const balancePDFRoutes = require('./routes/balancePDF.routes');
const balanceGeneralRoutes = require('./routes/balanceGeneral.routes');



const app = express();
// Orígenes permitidos: web publicada, desarrollo local y app Android (Capacitor).
// Se puede sobrescribir con ALLOWED_ORIGINS="https://a.com,https://b.com"
const DEFAULT_ALLOWED_ORIGINS = [
  'https://app-emprendedores-movil2.vercel.app',
  'http://localhost:8100',
  'http://127.0.0.1:8100',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  // Sin Origin = petición servidor a servidor (p. ej. IA_Service): CORS no aplica
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
}));
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/business', BusinessRoutes);
app.use('/api/ai-recommendation', aiRecomendationRoutes);
app.use('/api/historial-rentabilidad', historialRentabilidadRoutes);
app.use('/api/product-sold', productSoldRoutes);
app.use('/api/product', productRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/gasto-fijo', gastoFijoRoutes);
app.use('/api/rentabilidad', rentabilidadRoutes);
app.use('/api/gasto-fijo-pagado', gastoFijoPagadoRoutes);
app.use('/api/balance-semanal', balanceSemanalRoutes);
app.use('/api/balance-pdf', balancePDFRoutes);
app.use('/api/balance-general', balanceGeneralRoutes);

// Prueba de servidor
app.get('/', (req, res) => {
  res.json({ message: 'Backend con Express y Firebase listo 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  iniciarJobGastosFijos(); // Iniciar el job de gastos fijos al arrancar el servidor
  iniciarJobRentabilidad(); // Iniciar el job de rentabilidad al arrancar el servidor
});
