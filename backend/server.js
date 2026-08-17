import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes Imports 
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 1600;

// Connect Database & Start Server Always
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connection Successful!'))
  .catch((err) => console.log('Database Connection Warning:', err.message));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));