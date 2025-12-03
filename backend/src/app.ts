import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import rateLimitOptions from './configs/rateLimitOptions.js';
import corsOptions from './configs/corsOptions.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import journalEntryRoutes from './routes/journalEntriesRoutes.js';

import errorHandler from './middlewares/errorHandler.js';
import authenticate from './middlewares/authenticate.js';
import notFound from './middlewares/notFound.js';

const app = express();

// Middleware
app.use(rateLimit(rateLimitOptions));
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', authenticate, userRoutes);
app.use('/api/v1/entries', authenticate, journalEntryRoutes);

// Errors
app.use(errorHandler);
app.use(notFound);

export default app;
