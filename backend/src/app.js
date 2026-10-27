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

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://room-bot-service.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const isAllowed = allowedOrigins.some(o => {
      const normalizedO = o.endsWith('/') ? o.slice(0, -1) : o;
      return normalizedOrigin === normalizedO;
    });

    const envOrigin = env.CLIENT_URL.endsWith('/') ? env.CLIENT_URL.slice(0, -1) : env.CLIENT_URL;

    if (isAllowed || normalizedOrigin === envOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(requestId);
app.use(morgan('combined', { stream: { write: (message) => logger.info({ http: message.trim() }, 'HTTP request') } }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api', apiRateLimiter);
app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

