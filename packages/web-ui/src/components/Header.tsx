import { Sun, Moon, PanelRightClose, PanelRightOpen, Download, Wifi, WifiOff } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { agents, agentsByCategory, type Agent } from '../config/agents';
import clsx from 'clsx';

interface HeaderProps {
  onExport: (format: 'json' | 'markdown') => void;
}

export function Header({ onExport }: HeaderProps) {
  const {
    selectedAgent,
    setSelectedAgent,
    isDarkMode,
    toggleDarkMode,
    isSidePanelOpen,
    toggleSidePanel,
    connectionStatus,
    messages,
  } = useChatStore();

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agent = agents.find((a) => a.id === e.target.value);
    setSelectedAgent(agent || null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Enterprise AI Agents
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Claude
            </p>
          </div>
        </div>

        {/* Agent Selector */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedAgent?.id || ''}
              onChange={handleAgentChange}
              className={clsx(
                'appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm font-medium',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'dark:border-gray-600 dark:bg-gray-800 dark:text-white',
                'cursor-pointer transition-colors hover:border-gray-400 dark:hover:border-gray-500'
              )}
            >
              <option value="">Select an Agent</option>
              {Object.entries(agentsByCategory).map(([category, categoryAgents]) => (
                <optgroup key={category} label={category}>
                  {categoryAgents.map((agent: Agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : connectionStatus === 'connecting' ? (
              <Wifi className="h-4 w-4 animate-pulse text-yellow-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          {messages.length > 0 && (
            <div className="relative group">
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className="absolute right-0 top-full mt-1 hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => onExport('json')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => onExport('markdown')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Export as Markdown
                </button>
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Side Panel Toggle */}
          <button
            onClick={toggleSidePanel}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label={isSidePanelOpen ? 'Close side panel' : 'Open side panel'}
          >
            {isSidePanelOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
