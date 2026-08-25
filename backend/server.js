import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB } from './src/config/db.js';
import { handleWebhook } from './src/controllers/subscriptionController.js';

import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import pricingRoutes from './src/routes/pricingRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import cadRoutes from './src/routes/cadRoutes.js';
import driveRoutes from './src/routes/driveRoutes.js'; // <--- ADDED THIS LINE
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();
// Allow all origins for development (0.0.0.0, localhost, LAN IPs, etc.)
app.use(cors());
app.use(morgan('dev'));

// Stripe needs the raw body to verify its signature, mounted BEFORE express.json()
app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json({ limit: '25mb' }));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'illust-studio-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cad', cadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drive', driveRoutes); 
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Illust Studio API running on http://localhost:${PORT}`));