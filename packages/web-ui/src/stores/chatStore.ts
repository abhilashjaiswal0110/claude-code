import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '../config/agents';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export interface ToolCall {
  name: string;
  status: 'running' | 'completed' | 'error';
  result?: string;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
}

export interface Session {
  id: string;
  agentId: string;
  mode: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

interface ChatState {
  // Current session
  sessionId: string | null;
  selectedAgent: Agent | null;
  selectedMode: string;
  messages: Message[];
  isStreaming: boolean;

  // Pipeline progress
  pipelineStages: PipelineStage[];
  currentStage: number;

  // Uploaded files
  uploadedFiles: UploadedFile[];

  // UI state
  isDarkMode: boolean;
  isSidePanelOpen: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';

  // Session history
  sessionHistory: Session[];

  // Actions
  setSelectedAgent: (agent: Agent | null) => void;
  setSelectedMode: (mode: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setIsStreaming: (streaming: boolean) => void;
  setPipelineStages: (stages: PipelineStage[]) => void;
  updatePipelineStage: (index: number, updates: Partial<PipelineStage>) => void;
  setCurrentStage: (stage: number) => void;
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (id: string) => void;
  clearUploadedFiles: () => void;
  toggleDarkMode: () => void;
  toggleSidePanel: () => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setSessionId: (id: string | null) => void;
  saveSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  reset: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      selectedAgent: null,
      selectedMode: '',
      messages: [],
      isStreaming: false,
      pipelineStages: [],
      currentStage: -1,
      uploadedFiles: [],
      isDarkMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
      isSidePanelOpen: true,
      connectionStatus: 'disconnected',
      sessionHistory: [],

      // Actions
      setSelectedAgent: (agent) => {
        set({
          selectedAgent: agent,
          selectedMode: agent?.modes[0]?.id || '',
          messages: [],
          pipelineStages: [],
          currentStage: -1,
          sessionId: null,
        });
      },

      setSelectedMode: (mode) => set({ selectedMode: mode }),

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
        return newMessage.id;
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },

      clearMessages: () => set({ messages: [], pipelineStages: [], currentStage: -1 }),

      setIsStreaming: (streaming) => set({ isStreaming: streaming }),

      setPipelineStages: (stages) => set({ pipelineStages: stages, currentStage: 0 }),

      updatePipelineStage: (index, updates) => {
        set((state) => ({
          pipelineStages: state.pipelineStages.map((stage, i) =>
            i === index ? { ...stage, ...updates } : stage
          ),
        }));
      },

      setCurrentStage: (stage) => set({ currentStage: stage }),

      addUploadedFile: (file) => {
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file],
        }));
      },

      removeUploadedFile: (id) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
        }));
      },

      clearUploadedFiles: () => set({ uploadedFiles: [] }),

      toggleDarkMode: () => {
        set((state) => {
          const newMode = !state.isDarkMode;
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newMode };
        });
      },

      toggleSidePanel: () => set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen })),

      setConnectionStatus: (status) => set({ connectionStatus: status }),

      setSessionId: (id) => set({ sessionId: id }),

      saveSession: () => {
        const state = get();
        if (!state.selectedAgent || state.messages.length === 0) return;

        const session: Session = {
          id: state.sessionId || generateId(),
          agentId: state.selectedAgent.id,
          mode: state.selectedMode,
          messages: state.messages,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((s) => ({
          sessionId: session.id,
          sessionHistory: [
            session,
            ...s.sessionHistory.filter((h) => h.id !== session.id),
          ].slice(0, 50), // Keep last 50 sessions
        }));
      },

      loadSession: (sessionId) => {
        const state = get();
        const session = state.sessionHistory.find((s) => s.id === sessionId);
        if (session) {
          set({
            sessionId: session.id,
            messages: session.messages,
            selectedMode: session.mode,
          });
        }
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessionHistory: state.sessionHistory.filter((s) => s.id !== sessionId),
        }));
      },

      reset: () => {
        set({
          sessionId: null,
          selectedAgent: null,
          selectedMode: '',
          messages: [],
          isStreaming: false,
          pipelineStages: [],
          currentStage: -1,
          uploadedFiles: [],
        });
      },
    }),
    {
      name: 'enterprise-agents-chat',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sessionHistory: state.sessionHistory,
      }),
    }
  )
);

// Initialize dark mode from stored preference
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('enterprise-agents-chat');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      // Log parse errors for debugging but don't break the app
      console.warn('Failed to parse stored chat state:', error);
    }
  }
}
