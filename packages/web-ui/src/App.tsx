import { useCallback, useEffect } from 'react';
import { useChatStore } from './stores/chatStore';
import { agents, type Agent } from './config/agents';
import { Header } from './components/Header';
import { AgentCard } from './components/AgentCard';
import { ChatPanel } from './components/ChatPanel';
import { SidePanel } from './components/SidePanel';

function WelcomeScreen({ onSelectAgent }: { onSelectAgent: (agent: Agent) => void }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-white px-8 py-12 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Enterprise AI Agents
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Powerful AI assistants for HR, IT, Marketing, Sales, and more.
            Select an agent below to get started.
          </p>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Agents
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {agents.length} agents
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={onSelectAgent}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-8 py-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Claude AI &middot; Enterprise AI Agent Suite</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const {
    selectedAgent,
    setSelectedAgent,
    messages,
    isSidePanelOpen,
    clearUploadedFiles,
    setConnectionStatus,
  } = useChatStore();

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch {
        setConnectionStatus('disconnected');
        console.warn('API server not reachable. Make sure to run: npm run dev:api');
      }
    };

    checkApiHealth();

    // Re-check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, [setConnectionStatus]);

  const handleSelectAgent = useCallback(
    (agent: Agent) => {
      setSelectedAgent(agent);
      clearUploadedFiles();
    },
    [setSelectedAgent, clearUploadedFiles]
  );

  /**
   * Handles quick action button clicks by programmatically setting the textarea value.
   * 
   * Note: Direct DOM manipulation is used here as a pragmatic workaround to trigger
   * React's controlled input handling. The textarea is owned by a child component
   * (InputArea) and we need to inject the quick action text without lifting all
   * input state to the parent component.
   * 
   * Alternative approaches considered:
   * - Lifting state: Would require significant refactoring of InputArea
   * - Context/Store: Quick actions are simple enough that adding store complexity isn't warranted
   * - Refs via forwardRef: Would couple App tightly to InputArea internals
   * 
   * This approach works reliably for the current use case of injecting template prompts.
   */
  const handleQuickAction = useCallback(
    (action: string) => {
      const chatPanel = document.querySelector('textarea');
      if (chatPanel) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;
        nativeInputValueSetter?.call(chatPanel, action);
        chatPanel.dispatchEvent(new Event('input', { bubbles: true }));
        chatPanel.focus();
      }
    },
    []
  );

  const handleExport = useCallback(
    (format: 'json' | 'markdown') => {
      if (!selectedAgent || messages.length === 0) return;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${selectedAgent.id}-chat-${timestamp}`;

      if (format === 'json') {
        const data = {
          agent: {
            id: selectedAgent.id,
            name: selectedAgent.name,
          },
          exportedAt: new Date().toISOString(),
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        downloadFile(blob, `${filename}.json`);
      } else {
        let markdown = `# Chat with ${selectedAgent.name}\n\n`;
        markdown += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;

        for (const message of messages) {
          const role = message.role === 'user' ? '**You**' : `**${selectedAgent.name}**`;
          const time = new Date(message.timestamp).toLocaleTimeString();
          markdown += `### ${role} (${time})\n\n${message.content}\n\n---\n\n`;
        }

        const blob = new Blob([markdown], { type: 'text/markdown' });
        downloadFile(blob, `${filename}.md`);
      }
    },
    [selectedAgent, messages]
  );

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header onExport={handleExport} />

      <main className="flex flex-1 overflow-hidden">
        {selectedAgent ? (
          <>
            <ChatPanel agent={selectedAgent} />
            {isSidePanelOpen && (
              <SidePanel
                agent={selectedAgent}
                onQuickAction={handleQuickAction}
              />
            )}
          </>
        ) : (
          <WelcomeScreen onSelectAgent={handleSelectAgent} />
        )}
      </main>
    </div>
  );
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
