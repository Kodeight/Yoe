import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from './routes';

dotenv.config();

export const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// API Endpoints
app.use('/api', apiRouter);

export default app;
