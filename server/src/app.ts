import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import homeCategoryRoutes from './routes/HomeCategories.routes';
import settingsRoutes from './routes/settings.routes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import addressRoutes from './routes/addressRoutes';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/home-categories', homeCategoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/address', addressRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const setup = req.query.setup;
  
  if (setup === 'true') {
    // Run database setup
    const { exec } = require('child_process');
    exec('npm run deploy:setup', (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Database setup error:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database setup failed',
          error: error.message 
        });
      }
      console.log('Database setup completed:', stdout);
      res.json({ 
        status: 'success', 
        message: 'Database setup completed successfully',
        output: stdout 
      });
    });
  } else {
    res.json({ 
      status: 'healthy', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        clientUrl: process.env.CLIENT_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPaypalClientId: !!process.env.PAYPAL_CLIENT_ID,
        hasPaypalClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      }
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', success: false });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client disconnected');
  process.exit(0);
});

export { app, prisma }; 