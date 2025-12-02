import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import journalEntryRoutes from './routes/journalEntriesRoutes.js';

import errorHandler from './middlewares/errorHandler.js';
import authenticate from './middlewares/authenticate.js';

const app = express();

// Middleware
app.use(express.json()); // JSON parser
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', authenticate, userRoutes);
app.use('/api/v1/entries', authenticate, journalEntryRoutes);

// Errors
app.use(errorHandler);
//TODO: add 404 error handler

export default app;
