import express from 'express';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(express.json()); // JSON parser
app.use(morgan('tiny'));

// Routes

// Errors

export default app;
