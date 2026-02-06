import { useQuery, useMutation } from '@tanstack/react-query';

export interface ApiAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  modes: { id: string; label: string; description: string }[];
}

export interface ApiSession {
  id: string;
  agentId: string;
  mode: string;
  createdAt: string;
}

async function fetchAgents(): Promise<ApiAgent[]> {
  const response = await fetch('/api/agents');
  if (!response.ok) {
    throw new Error('Failed to fetch agents');
  }
  return response.json();
}

async function fetchAgent(id: string): Promise<ApiAgent> {
  const response = await fetch(`/api/agents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch agent');
  }
  return response.json();
}

async function createSession(agentId: string, mode: string): Promise<ApiSession> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, mode }),
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
}

async function uploadFile(file: File): Promise<{ id: string; name: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  return response.json();
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    staleTime: Infinity,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgent(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: ({ agentId, mode }: { agentId: string; mode: string }) =>
      createSession(agentId, mode),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
