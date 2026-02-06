import express from 'express';
import cors from 'cors';
import agentsRouter from './routes/agents.js';
import sessionsRouter from './routes/sessions.js';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';

const app = express();

// Parse CORS origins from environment variable or use defaults
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : defaultOrigins;

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/agents', agentsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);

// Error handling middleware
// Note: Express requires all 4 parameters to recognize this as an error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Prevent unused variable warnings while maintaining Express error handler signature
  void req;
  void next;
  
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
