import { Router, type Request, type Response } from 'express';
import { agentService } from '../services/AgentService.js';

const router = Router();

// GET /api/agents - List all agents
router.get('/', (_req: Request, res: Response) => {
  const agents = agentService.getAll();
  res.json(agents);
});

// GET /api/agents/:id - Get agent by ID
router.get('/:id', (req: Request, res: Response) => {
  const agent = agentService.getById(req.params.id);

  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }

  res.json(agent);
});

export default router;
