import 'dotenv/config';
import app from './server.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 Enterprise AI Agents API Server                      ║
║                                                           ║
║   Server running on http://localhost:${PORT}                ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /health           - Health check                 ║
║   • GET  /api/agents       - List all agents              ║
║   • GET  /api/agents/:id   - Get agent details            ║
║   • POST /api/sessions     - Create session               ║
║   • POST /api/chat/:id/message - Send message (SSE)       ║
║   • POST /api/upload       - Upload file                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
