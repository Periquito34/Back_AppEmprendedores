require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const BusinessRoutes = require('./routes/business.routes');
const aiRecomendationRoutes= require('./routes/aiRecomendation.routes');
const historialRentabilidadRoutes = require('./routes/historialRentabilidad.routes');
const productSoldRoutes = require('./routes/productSold.routes');
const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const gastoFijoRoutes = require('./routes/gastoFijo.routes');


const app = express();
app.use(cors());
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

// Prueba de servidor
app.get('/', (req, res) => {
  res.json({ message: 'Backend con Express y Firebase listo 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
