import { Router, type Request, type Response } from 'express';
import { sessionService } from '../services/SessionService.js';
import { agentService } from '../services/AgentService.js';

const router = Router();

// POST /api/sessions - Create a new session
router.post('/', (req: Request, res: Response) => {
  const { agentId, mode } = req.body;

  if (!agentId || !mode) {
    res.status(400).json({ error: 'agentId and mode are required' });
    return;
  }

  if (!agentService.hasAgent(agentId)) {
    res.status(400).json({ error: 'Invalid agent ID' });
    return;
  }

  const session = sessionService.create(agentId, mode);

  res.status(201).json({
    id: session.id,
    agentId: session.agentId,
    mode: session.mode,
    createdAt: session.createdAt.toISOString(),
  });
});

// GET /api/sessions/:id - Get session details
router.get('/:id', (req: Request, res: Response) => {
  const session = sessionService.get(req.params.id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({
    id: session.id,
    agentId: session.agentId,
    mode: session.mode,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messageCount: session.messages.length,
  });
});

// GET /api/sessions/:id/messages - Get session messages
router.get('/:id/messages', (req: Request, res: Response) => {
  const messages = sessionService.getMessages(req.params.id);

  if (!messages.length && !sessionService.get(req.params.id)) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(messages);
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = sessionService.delete(req.params.id);

  if (!deleted) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.status(204).send();
});

export default router;
