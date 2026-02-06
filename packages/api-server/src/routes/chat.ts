import { Router, type Request, type Response } from 'express';
import { sessionService } from '../services/SessionService.js';
import { agentService } from '../services/AgentService.js';
import type { ChatRequest, StreamEvent } from '../types.js';

const router = Router();

/**
 * Active streams for cancellation, keyed by session ID.
 * 
 * NOTE: Only one active stream per session is supported. If a user sends
 * multiple messages quickly, the previous stream will be aborted to prevent
 * response interleaving. This is intentional behavior to ensure coherent responses.
 */
const activeStreams = new Map<string, AbortController>();

// POST /api/chat/:sessionId/message - Send a message and stream response
router.post('/:sessionId/message', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { content, mode, files } = req.body as ChatRequest;

  // Validate session
  const session = sessionService.get(sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // Get adapter
  const adapter = agentService.getAdapter(session.agentId);
  if (!adapter) {
    res.status(500).json({ error: 'Agent adapter not found' });
    return;
  }

  // Update mode if provided
  if (mode && mode !== session.mode) {
    sessionService.update(sessionId, { mode });
  }

  // Add user message
  sessionService.addMessage(sessionId, {
    role: 'user',
    content,
  });

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Create abort controller for this stream
  const abortController = new AbortController();
  activeStreams.set(sessionId, abortController);

  // Helper to send SSE events
  const sendEvent = (event: StreamEvent) => {
    if (!abortController.signal.aborted) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  };

  try {
    // Process message with streaming
    const result = await adapter.processMessage(
      {
        topic: content,
        mode: mode || session.mode,
        additionalContext: files?.join(', '),
        files,
      },
      sendEvent
    );

    // Add assistant message to session
    sessionService.addMessage(sessionId, {
      role: 'assistant',
      content: result,
    });

    // Signal completion
    res.write('data: [DONE]\n\n');
  } catch (error) {
    if (!abortController.signal.aborted) {
      sendEvent({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } finally {
    activeStreams.delete(sessionId);
    res.end();
  }
});

// POST /api/chat/:sessionId/stop - Stop generation
router.post('/:sessionId/stop', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const controller = activeStreams.get(sessionId);
  if (controller) {
    controller.abort();
    activeStreams.delete(sessionId);
    res.json({ stopped: true });
  } else {
    res.json({ stopped: false, message: 'No active stream found' });
  }
});

export default router;
