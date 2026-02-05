/**
 * Environment variable validation
 */

export function validateEnvironment(requiredVars: string[] = ['ANTHROPIC_API_KEY']): void {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(`\n[Error] Missing required environment variables: ${missing.join(', ')}`);
    console.error('');
    console.error('To fix this:');
    console.error('  1. Copy .env.example to .env');
    console.error('  2. Add your API key from https://console.anthropic.com/');
    console.error('');
    process.exit(1);
  }
}
