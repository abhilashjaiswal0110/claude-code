import { useCallback, useEffect, useRef } from 'react';
import { RefreshCw, HelpCircle, List, Activity } from 'lucide-react';
import type { Agent } from '../config/agents';
import { useChatStore } from '../stores/chatStore';
import { useStream } from '../hooks/useStream';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

interface ChatPanelProps {
  agent: Agent;
}

export function ChatPanel({ agent }: ChatPanelProps) {
  const {
    sessionId,
    setSessionId,
    messages,
    selectedMode,
    isStreaming,
    clearMessages,
    addMessage,
    setPipelineStages,
    updatePipelineStage,
    setCurrentStage,
    saveSession,
    setConnectionStatus,
  } = useChatStore();

  const { sendMessage, stopStream } = useStream();
  const sessionCreatingRef = useRef(false);

  // Create session on mount or agent change
  useEffect(() => {
    const createNewSession = async () => {
      if (agent && !sessionId && !sessionCreatingRef.current) {
        sessionCreatingRef.current = true;
        setConnectionStatus('connecting');

        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: agent.id, mode: selectedMode }),
          });

          if (response.ok) {
            const session = await response.json();
            setSessionId(session.id);
            setConnectionStatus('connected');
          } else {
            console.error('Failed to create session:', response.status);
            setConnectionStatus('disconnected');
          }
        } catch (error) {
          console.error('Failed to create session:', error);
          setConnectionStatus('disconnected');
        } finally {
          sessionCreatingRef.current = false;
        }
      }
    };

    createNewSession();
  }, [agent, sessionId, selectedMode, setSessionId, setConnectionStatus]);

  const handleSend = useCallback(
    async (content: string, files: string[]) => {
      // Handle commands
      if (content.startsWith('/')) {
        const command = content.slice(1).toLowerCase().split(' ')[0];

        switch (command) {
          case 'clear':
            clearMessages();
            addMessage({
              role: 'assistant',
              content: 'Chat cleared. How can I help you?',
            });
            return;

          case 'help':
            addMessage({ role: 'user', content });
            addMessage({
              role: 'assistant',
              content: `## Available Commands

- \`/clear\` - Clear chat history
- \`/history\` - View session history
- \`/status\` - Show system status
- \`/help\` - Show this help message

## Current Agent: ${agent.name}

${agent.description}

### Available Modes
${agent.modes.map((m) => `- **${m.label}**: ${m.description}`).join('\n')}
`,
            });
            return;

          case 'status':
            addMessage({ role: 'user', content });
            addMessage({
              role: 'assistant',
              content: `## System Status

- **Agent**: ${agent.name}
- **Mode**: ${selectedMode}
- **Session**: ${sessionId || 'Not created'}
- **Messages**: ${messages.length}
- **Status**: Connected
`,
            });
            return;

          case 'history':
            addMessage({ role: 'user', content });
            addMessage({
              role: 'assistant',
              content: 'Check the Session History panel on the right to view and load previous sessions.',
            });
            return;
        }
      }

      // Ensure we have a session
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        setConnectionStatus('connecting');
        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: agent.id, mode: selectedMode }),
          });

          if (!response.ok) {
            throw new Error('Failed to create session');
          }

          const session = await response.json();
          currentSessionId = session.id;
          setSessionId(session.id);
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Failed to create session:', error);
          setConnectionStatus('disconnected');
          addMessage({
            role: 'assistant',
            content: 'Failed to connect to the server. Please make sure the API server is running on port 3001.',
          });
          return;
        }
      }

      // Set up pipeline stages based on mode
      const stages = [
        { name: 'Understanding Query', status: 'pending' as const },
        { name: 'Processing', status: 'pending' as const },
        { name: 'Generating Response', status: 'pending' as const },
      ];
      setPipelineStages(stages);
      setCurrentStage(0);
      updatePipelineStage(0, { status: 'running' });

      // Send message with streaming
      // currentSessionId is guaranteed to be non-null here (either from sessionId or newly created)
      await sendMessage(
        currentSessionId!,
        content,
        selectedMode,
        files,
        {
          onStageUpdate: (index, _name, status) => {
            updatePipelineStage(index, { status: status as 'pending' | 'running' | 'completed' | 'error' });
            if (status === 'completed' && index < stages.length - 1) {
              setCurrentStage(index + 1);
              updatePipelineStage(index + 1, { status: 'running' });
            }
          },
          onComplete: () => {
            stages.forEach((_, i) => updatePipelineStage(i, { status: 'completed' }));
            saveSession();
          },
          onError: () => {
            // Mark only non-completed stages as error
            // Access current store state to preserve completed stages
            const currentStages = useChatStore.getState().pipelineStages;
            currentStages.forEach((stage, i) => {
              if (stage.status !== 'completed') {
                updatePipelineStage(i, { status: 'error' });
              }
            });
          },
        }
      );
    },
    [
      sessionId,
      agent,
      selectedMode,
      messages.length,
      setSessionId,
      setConnectionStatus,
      clearMessages,
      addMessage,
      setPipelineStages,
      setCurrentStage,
      updatePipelineStage,
      sendMessage,
      saveSession,
    ]
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {agent.icon} {agent.name}
          </span>
          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {agent.modes.find((m) => m.id === selectedMode)?.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            title="Clear chat"
          >
            <RefreshCw className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-5xl">{agent.icon}</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Start a conversation with {agent.name}
          </h2>
          <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
            {agent.description}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {agent.quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action, [])}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Type /help for commands
            </div>
            <div className="flex items-center gap-1.5">
              <List className="h-4 w-4" />
              {agent.modes.length} modes available
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Pipeline tracking
            </div>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      {/* Input */}
      <InputArea
        agent={agent}
        onSend={handleSend}
        onStop={stopStream}
        isStreaming={isStreaming}
      />
    </div>
  );
}
