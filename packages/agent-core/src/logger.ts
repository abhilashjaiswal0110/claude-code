/**
 * Structured console logging with stage indicators
 */

const DIVIDER = '═'.repeat(60);
const SUB_DIVIDER = '─'.repeat(60);

export function logHeader(agentName: string): void {
  console.log(`\n${DIVIDER}`);
  console.log(agentName);
  console.log(DIVIDER);
}

export function logStageStart(stageNumber: number, totalStages: number, stageName: string): void {
  console.log(`\n[Stage ${stageNumber}/${totalStages}] ${stageName}...\n`);
}

export function logStageComplete(stageName: string): void {
  console.log(`\n\n[${stageName} completed]`);
  console.log(`\n${SUB_DIVIDER}`);
}

export function logResult(label: string, content: string): void {
  console.log(`\n${DIVIDER}`);
  console.log(label);
  console.log(`${DIVIDER}\n`);
  console.log(content);
  console.log(`\n${DIVIDER}`);
}

export function logInfo(message: string): void {
  console.log(`\n[Info] ${message}`);
}

export function logSaved(path: string): void {
  console.log(`\n[Saved] Output saved to: ${path}`);
}

export function logDone(message: string): void {
  console.log(`\n[Done] ${message}`);
}

export function logError(message: string, error?: unknown): void {
  console.error(`\n[Error] ${message}`, error || '');
}

export function logProgress(): void {
  process.stdout.write('.');
}

export const logger = {
  header: logHeader,
  stageStart: logStageStart,
  stageComplete: logStageComplete,
  result: logResult,
  info: logInfo,
  saved: logSaved,
  done: logDone,
  error: logError,
  progress: logProgress,
};
