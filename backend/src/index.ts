import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import ticketsRouter from './routes/tickets.router';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later.' } },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/tickets', ticketsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

// Error handler
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`\n🚀 ZenDesk Dashboard Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CORS_ORIGIN}`);
  console.log(`   N8N webhook: ${env.N8N_WEBHOOK_URL}\n`);
});

export default app;
