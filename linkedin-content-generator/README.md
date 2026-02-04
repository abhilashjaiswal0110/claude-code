# LinkedIn Content Generator Agent

An AI-powered agent that researches topics and generates professional LinkedIn content, built with the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview).

## Overview

This agent automates LinkedIn content creation by:

1. **Researching** the given topic using web search
2. **Generating** two post variations (hook-focused and value-focused)
3. **Suggesting** appropriate images for the content
4. **Recommending** optimal posting schedules for maximum engagement

All content is generated in a professional thought-leadership persona, optimized for LinkedIn's algorithm and engagement patterns.

## Features

| Feature | Description |
|---------|-------------|
| **Web Research** | Gathers current trends, statistics, and expert insights |
| **Dual Variations** | Creates hook-focused and value-focused post styles |
| **Image Suggestions** | Recommends visuals with descriptions and keywords |
| **Scheduling** | Provides optimal posting times for target audience |
| **Copy-Ready Output** | Content formatted for direct LinkedIn use |

## Prerequisites

- Node.js 18.0.0 or higher
- [Claude Code CLI](https://code.claude.com/docs/en/setup) installed
- Anthropic API key from [Anthropic Console](https://console.anthropic.com/)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/linkedin-content-generator.git
cd linkedin-content-generator

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Usage

### Basic Usage

```bash
# Generate content for a topic
npm start "AI Agents in Enterprise"

# Or run with ts-node directly
npx ts-node --esm src/index.ts "Your Topic Here"
```

### Programmatic Usage

```typescript
import { generateLinkedInContent } from './src/index.js';

const content = await generateLinkedInContent({
  topic: 'The Future of AIOps',
  additionalContext: 'Focus on enterprise IT operations'
});

console.log(content.posts);
```

## Output Structure

The agent generates a complete content package:

```
========================================
GENERATED CONTENT
========================================

## VARIATION 1: Hook-Focused
[Compelling post with narrative hook]

## VARIATION 2: Value-Focused
[Structured post with actionable insights]

## IMAGE SUGGESTIONS
[Visual content recommendations]

## SCHEDULING
[Optimal posting times and rationale]

========================================
```

## Configuration

### Persona Customization

Edit `src/persona.ts` to customize the writing persona:

```typescript
export const YOUR_PERSONA: LinkedInPersona = {
  name: 'Your Name',
  title: 'Your Title',
  company: 'Your Company',
  expertise: ['Area 1', 'Area 2'],
  writingStyle: {
    tone: 'thought-leadership',
    characteristics: ['Technical depth', 'Practical focus'],
    avoidances: ['Jargon', 'Generic statements']
  }
};
```

### Prompt Customization

Modify `src/prompts.ts` to adjust content generation behavior.

## Project Structure

```
linkedin-content-generator/
├── src/
│   ├── index.ts        # Main agent entry point
│   ├── persona.ts      # LinkedIn persona configuration
│   ├── prompts.ts      # System prompts for generation
│   └── types.ts        # TypeScript type definitions
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

## Development

```bash
# Type checking
npm run typecheck

# Build for production
npm run build

# Development mode with watch
npm run dev
```

## API Reference

### `generateLinkedInContent(request: ContentRequest): Promise<GeneratedContent>`

Main function to generate LinkedIn content.

**Parameters:**
- `request.topic` (string): The topic to research and write about
- `request.additionalContext` (string, optional): Additional context or focus areas

**Returns:** `GeneratedContent` object containing posts, image suggestions, and scheduling.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Abhilash Jaiswal**
- LinkedIn: [jaiswal-abhilash](https://linkedin.com/in/jaiswal-abhilash)
- Role: GenAI Lead | Future-ready CTO | Patent Holder at Atos GDC India

## Acknowledgments

- Built with [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
- Powered by [Claude](https://anthropic.com/claude) by Anthropic
