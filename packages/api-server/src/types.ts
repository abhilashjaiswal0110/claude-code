export interface AgentMode {
  id: string;
  label: string;
  description: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  modes: AgentMode[];
}

export interface Session {
  id: string;
  agentId: string;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  context?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  status: 'running' | 'completed' | 'error';
  result?: string;
}

export interface StreamEvent {
  type: 'content' | 'thinking' | 'tool_call' | 'stage' | 'error' | 'done';
  content?: string;
  tool?: string;
  status?: string;
  index?: number;
  name?: string;
  message?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface ChatRequest {
  content: string;
  mode: string;
  files?: string[];
}
