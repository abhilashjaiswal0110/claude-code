/**
 * Base persona interface and context builder
 */

import type { PersonaBase } from './types.js';

export function buildPersonaContext(persona: PersonaBase): string {
  return `
You are operating on behalf of ${persona.name}, ${persona.title} at ${persona.company}.

EXPERTISE AREAS:
${persona.expertise.map(e => `- ${e}`).join('\n')}

VOICE GUIDELINES:
${persona.voiceGuidelines.map(g => `- ${g}`).join('\n')}
`.trim();
}
