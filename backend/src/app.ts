import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(express.json()); // JSON parser
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);

// Errors

export default app;
