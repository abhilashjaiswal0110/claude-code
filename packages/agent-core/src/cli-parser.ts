/**
 * CLI argument parsing for agents
 */

export interface ParsedArgs {
  topic: string;
  mode: string;
  additionalContext?: string;
}

export function parseCliArgs(
  defaultTopic: string,
  defaultMode: string,
  validModes: string[]
): ParsedArgs {
  const args = process.argv.slice(2);

  let mode = defaultMode;
  let topicParts: string[] = [];
  let additionalContext: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && i + 1 < args.length) {
      mode = args[i + 1];
      i++;
    } else if (args[i] === '--context' && i + 1 < args.length) {
      additionalContext = args[i + 1];
      i++;
    } else {
      topicParts.push(args[i]);
    }
  }

  const topic = topicParts.length > 0 ? topicParts.join(' ') : defaultTopic;

  if (!validModes.includes(mode)) {
    console.error(`\n[Error] Invalid mode: "${mode}"`);
    console.error(`Valid modes: ${validModes.join(', ')}`);
    process.exit(1);
  }

  return { topic, mode, additionalContext };
}
