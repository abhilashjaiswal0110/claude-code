import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Upload, X, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import clsx from 'clsx';
import { useChatStore, type UploadedFile } from '../stores/chatStore';
import type { Agent } from '../config/agents';

interface InputAreaProps {
  agent: Agent;
  onSend: (content: string, files: string[]) => void;
  onStop: () => void;
  isStreaming: boolean;
}

const fileIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'application/pdf': FileText,
  'text/csv': FileSpreadsheet,
  'text/plain': FileType,
  'text/markdown': FileType,
};

function FilePreview({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  const Icon = fileIcons[file.type] || FileType;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <span className="max-w-[150px] truncate text-sm text-gray-700 dark:text-gray-300">
        {file.name}
      </span>
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function InputArea({ agent, onSend, onStop, isStreaming }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedMode,
    setSelectedMode,
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
  } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming) return;

    onSend(
      trimmedInput,
      uploadedFiles.map((f) => f.id)
    );
    setInput('');
  }, [input, isStreaming, onSend, uploadedFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'text/csv',
        'text/plain',
        'text/markdown',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
        // TODO: Replace with toast notification component for better UX
        // Consider using a toast library like react-hot-toast or sonner
        alert(`Invalid file type: ${file.name}`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        // TODO: Replace with toast notification component for better UX
        alert(`File too large: ${file.name} (max 10MB)`);
        continue;
      }

      // Add file to store (in real implementation, upload to server first)
      addUploadedFile({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Mode Selector */}
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mode:
          </label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {agent.modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {agent.modes.find((m) => m.id === selectedMode)?.description}
          </span>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={() => removeUploadedFile(file.id)}
              />
            ))}
          </div>
        )}

        {/* Input Container */}
        <div
          className={clsx(
            'relative rounded-xl border-2 transition-colors',
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
              : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary-500/10">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <Upload className="h-5 w-5" />
                <span className="font-medium">Drop files here</span>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 p-2">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Upload file"
            >
              <Upload className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.csv,.txt,.md,.docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${agent.name} something...`}
              rows={1}
              className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
              disabled={isStreaming}
            />

            {/* Send/Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex-shrink-0 rounded-lg bg-red-500 p-2.5 text-white transition-colors hover:bg-red-600"
                title="Stop generation"
              >
                <Square className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={clsx(
                  'flex-shrink-0 rounded-lg p-2.5 transition-colors',
                  input.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                )}
                title="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          Press <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono dark:bg-gray-700">Enter</kbd> to send,{' '}
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono dark:bg-gray-700">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
