# Contributing to LinkedIn Content Generator

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS)

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the use case and expected behavior
3. Explain why this would benefit other users

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/linkedin-content-generator.git
cd linkedin-content-generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run type checking
npm run typecheck
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define explicit types for function parameters and returns
- Use interfaces for object shapes
- Prefer `const` over `let` when possible

### Code Style

```typescript
// Good: Explicit types, clear naming
async function generateContent(topic: string): Promise<ContentResult> {
  const research = await performResearch(topic);
  return formatContent(research);
}

// Avoid: Implicit any, unclear names
async function gen(t) {
  const r = await doIt(t);
  return fmt(r);
}
```

### File Organization

- One component/module per file
- Group related functionality
- Use barrel exports (`index.ts`) for public APIs

### Comments

- Use JSDoc for public functions
- Explain "why" not "what"
- Keep comments up to date

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(prompts): add custom persona support
fix(research): handle API timeout errors
docs(readme): update installation instructions
```

## Pull Request Process

1. Ensure all tests pass and types check
2. Update README.md if adding features
3. Add yourself to CONTRIBUTORS.md (if applicable)
4. Request review from maintainers
5. Address review feedback promptly

## Testing

```bash
# Run type checking
npm run typecheck

# Run linter (if configured)
npm run lint
```

## Questions?

Feel free to open an issue for any questions about contributing.

---

Thank you for contributing!
