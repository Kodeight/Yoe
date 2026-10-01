import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './routes';

dotenv.config();

export const app = express();
app.use(express.json());

// API Endpoints
app.use('/api', apiRouter);

export default app;
