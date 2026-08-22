import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { requestId } from './middleware/request-id.js';
import { apiRateLimiter } from './middleware/rate-limit.js';
import { logger } from './utils/logger.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.use(requestId);
app.use(morgan('combined', { stream: { write: (message) => logger.info({ http: message.trim() }, 'HTTP request') } }));
app.use('/api', apiRateLimiter);
app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

