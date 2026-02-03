# Claude Code Examples

**Last Updated:** February 2026

This guide provides practical examples of using Claude Code and its plugins for common tasks.

## Table of Contents

1. [Basic Usage](#basic-usage) - Starting, understanding codebase, navigation, quick fixes
2. [Git Workflow](#git-workflow) - Smart commits, PR creation, branch cleanup
3. [Code Review](#code-review) - Automated and manual code review
4. [Feature Development](#feature-development) - Using Feature Dev plugin and manual development
5. [Custom Hooks](#custom-hooks) - Creating and managing Hookify rules
6. [Plugin Development](#plugin-development) - Creating simple and manual plugins
7. [Security & Quality](#security--quality) - Security guidance and patterns
8. [Advanced Examples](#advanced-examples) - Combining plugins, custom workflows
9. [Tips & Tricks](#tips--tricks) - Pro tips for using Claude Code
10. [Common Workflows](#common-workflows) - Standup, cleanup, bug fixing, refactoring
11. [Next Steps](#next-steps)

---

## Basic Usage

### Starting Claude Code

```bash
# Navigate to your project
cd your-project

# Start Claude Code
claude

# You'll see the prompt
>
```

### Understanding Your Codebase

```bash
> What does this codebase do?

> Show me the main entry point

> Find all database-related files

> Explain the authentication flow

> What tests are missing?

> Show me all TODO comments
```

### Code Navigation

```bash
> Find where the User class is defined

> Show me all files that import 'express'

> What functions call validateUser?

> Show me the API routes

> Find all React components
```

### Quick Fixes

```bash
> Fix the TypeScript errors in auth.ts

> Add error handling to the login function

> Make this code more efficient

> Add JSDoc comments to this file

> Refactor this to use async/await
```

---

## Git Workflow

### Using Commit Commands Plugin

#### Smart Commits
```bash
# Load the plugin
> Install commit-commands plugin

# Make some changes, then:
> /commit

# Claude will:
# 1. Review your changes
# 2. Generate a descriptive commit message
# 3. Commit with proper formatting
```

#### Commit, Push, and PR
```bash
# Create a new feature branch
> git checkout -b feature/new-auth

# Make changes, then:
> /commit-push-pr "Add OAuth authentication"

# Claude will:
# 1. Commit with smart message
# 2. Push to remote
# 3. Create a pull request with description
```

#### Clean Up Branches
```bash
# After merging PRs, clean up local branches
> /clean_gone

# Removes all local branches that are deleted on remote
```

### Manual Git Operations

```bash
> Create a new branch called feature/user-profile

> Show me what files have changed

> Create a commit message for these changes

> Push this branch to origin

> Create a pull request with description
```

---

## Code Review

### Automated PR Review

#### Using Code Review Plugin
```bash
# Review current PR
> /code-review

# Claude runs 5 specialized agents in parallel:
# - CLAUDE.md compliance checker
# - Bug detector
# - Historical context analyzer
# - PR history analyzer
# - Code comment analyzer

# Results are filtered by confidence score
```

#### Using PR Review Toolkit

```bash
# Full comprehensive review
> /pr-review-toolkit:review-pr all

# Review specific aspects
> /pr-review-toolkit:review-pr tests
> /pr-review-toolkit:review-pr comments
> /pr-review-toolkit:review-pr errors
> /pr-review-toolkit:review-pr types
> /pr-review-toolkit:review-pr code
> /pr-review-toolkit:review-pr simplify
```

**Example Output:**
```
=== Test Coverage Analysis ===
✓ Login function has unit tests
✗ Missing tests for password reset
✗ No integration tests for OAuth flow

=== Error Handling Analysis ===
⚠️ API call in auth.ts lacks try-catch
⚠️ Database query has no error handling
✓ Validation errors properly handled

=== Type Design Analysis ===
✓ Strong typing throughout
⚠️ Consider using discriminated unions for AuthResult
```

### Manual Code Review

```bash
> Review the changes in auth.ts

> Are there any security issues in this code?

> Check if error handling is complete

> Suggest improvements for this function

> Is this code properly tested?
```

---

## Feature Development

### Using Feature Dev Plugin

```bash
> /feature-dev Add user profile page with avatar upload

# Phase 1: Requirements Gathering
# Claude asks clarifying questions:
# - What fields should the profile include?
# - Where should avatars be stored?
# - Authentication requirements?

# Phase 2: Codebase Exploration
# Code Explorer agent analyzes:
# - Existing user model
# - Current authentication
# - File upload patterns
# - UI component library

# Phase 3: Architecture Design
# Code Architect agent designs:
# - API endpoints needed
# - Database schema changes
# - Frontend components
# - State management approach

# Phase 4: Implementation Planning
# Creates detailed checklist:
# - [ ] Update User model
# - [ ] Create profile API endpoints
# - [ ] Build ProfilePage component
# - [ ] Add avatar upload handler
# - [ ] Write tests

# Phase 5: Development
# Implements each item systematically

# Phase 6: Testing
# Creates and runs tests

# Phase 7: Review & Refinement
# Code Reviewer agent checks quality
```

### Manual Feature Development

```bash
> I want to add user profile functionality

> What files do I need to change?

> Create the API endpoints for profile

> Build the frontend profile page

> Add tests for the new feature

> Update the documentation
```

---

## Custom Hooks

### Using Hookify Plugin

#### Creating Rules from Conversation

```bash
> /hookify

# Claude analyzes recent conversation and suggests rules
# Example: "I noticed you're worried about console.log in production.
# Would you like me to create a rule to warn about that?"

> Yes

# Creates .claude/hookify.console-log-warning.local.md
```

#### Creating Rules from Instructions

```bash
# Prevent dangerous commands
> /hookify Warn me when I use rm -rf commands

# Enforce coding standards
> /hookify Don't allow console.log in TypeScript files

# Block sensitive operations
> /hookify Stop me from committing files with TODO comments

# Warn about patterns
> /hookify Warn when I use deprecated APIs
```

#### Managing Rules

```bash
# List all rules
> /hookify:list

# Output:
# Active Rules:
# 1. console-log-warning (warn) - Warns about console.log
# 2. rm-rf-warning (warn) - Prevents rm -rf commands
# 3. todo-stop (stop) - Stops commits with TODO

# Configure rules
> /hookify:configure

# Disable a rule
> /hookify:configure disable console-log-warning

# Enable a rule
> /hookify:configure enable console-log-warning

# Get help
> /hookify:help
```

#### Example Rules

**1. Console.log Warning:**
```yaml
---
action: warn
match_type: tool_use
tool_name: replace_string_in_file
pattern: console\.log
---
# Console.log Warning

Avoid using console.log in production code. Use a proper logging library instead.
```

**2. Dangerous Command Prevention:**
```yaml
---
action: stop
match_type: tool_use
tool_name: run_in_terminal
pattern: rm\s+-rf\s+/
---
# Dangerous Command Detected

This command could delete system files. Please review carefully.
```

**3. Required Tests:**
```yaml
---
action: stop
match_type: tool_use
tool_name: create_file
pattern: \.ts$
conditions:
  - no_matching_test_file
---
# Tests Required

Please create tests for this file before proceeding.
```

---

## Plugin Development

### Creating a Simple Plugin

```bash
> /plugin-dev:create-plugin

# Step-by-step wizard:
# 1. Plugin name: my-linter
# 2. Description: Custom linting rules
# 3. Category: quality
# 4. Add command? Yes
# 5. Command name: lint
# 6. Add agent? No
# 7. Add hooks? Yes
# 8. Hook type: PreToolUse

# Creates structure:
# my-linter/
# ├── .claude-plugin/
# │   └── plugin.json
# ├── commands/
# │   └── lint.md
# ├── hooks/
# │   ├── hooks.json
# │   └── pretooluse.py
# └── README.md
```

### Manual Plugin Creation

```bash
# Create plugin structure
> Create a new directory called my-plugin

> In my-plugin, create .claude-plugin/plugin.json with:
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": {
    "name": "Your Name"
  }
}

# Add a command
> Create commands/hello.md with a slash command that greets the user

# Test it
> /hello
```

---

## Security & Quality

### Security Guidance Plugin

```bash
# Automatic security warnings when editing files

# Example: Editing a file with eval()
> Update api.ts to use eval for dynamic code

# Security Guidance Hook triggers:
# ⚠️ Security Warning: eval() usage detected
# eval() can execute arbitrary code and is a security risk.
# Consider safer alternatives like:
# - JSON.parse() for JSON data
# - Function constructor with sanitized input
# - Sandboxed execution environment
```

### Security Patterns Detected

1. **Command Injection:**
   - `exec()`, `spawn()` with user input
   
2. **XSS Vulnerabilities:**
   - `dangerouslySetInnerHTML`
   - Unescaped user content
   
3. **eval() Usage:**
   - `eval()`, `new Function()`
   
4. **Pickle Deserialization:**
   - `pickle.loads()` with untrusted data
   
5. **SQL Injection:**
   - String concatenation in queries
   
6. **Path Traversal:**
   - `../` in file paths
   
7. **os.system Calls:**
   - Direct shell command execution

### Manual Security Review

```bash
> Review this code for security vulnerabilities

> Check if user input is properly sanitized

> Are there any SQL injection risks?

> Review authentication implementation

> Check for XSS vulnerabilities
```

---

## Advanced Examples

### Combining Multiple Plugins

```bash
# Use feature-dev for structure, hookify for safety
> Install feature-dev
> Install hookify
> /hookify Don't allow TODO comments in production code

# Now start feature development
> /feature-dev Add payment processing

# Claude will:
# 1. Follow structured feature development
# 2. Warn if TODO comments are added
# 3. Enforce quality standards
```

### Custom Workflow

```bash
# 1. Explore codebase
> Analyze the architecture of this project

# 2. Create feature
> /feature-dev Add email notifications

# 3. Create safety rules
> /hookify Warn about email credentials in code

# 4. Review code
> /pr-review-toolkit:review-pr all

# 5. Commit
> /commit-push-pr "Add email notification system"
```

### Learning While Coding

```bash
# Install learning-output-style plugin
> Install learning-output-style

# Now Claude will:
# - Explain why certain approaches are chosen
# - Ask you to write meaningful code at decision points
# - Provide educational insights
# - Teach best practices

# Example interaction:
> Add authentication

# Claude: "I'll implement JWT authentication. At key decision points,
# I'll ask you to write some code to help you learn. First, here's
# why JWT is a good choice for this use case..."
```

---

## Tips & Tricks

### 1. Chain Commands
```bash
> Find all TODOs, create issues for them, then remove the TODO comments
```

### 2. Context Building
```bash
> First, show me the user model. Then show me the auth controller.
> Now create tests for the login function.
```

### 3. Iterative Refinement
```bash
> Create a login page
# Review output
> Make it more modern with better styling
# Review again
> Add loading states and error handling
```

### 4. Combine with Git
```bash
> Show me changes in the last commit
> Create a PR description based on recent commits
> Review changes before committing
```

### 5. Documentation Generation
```bash
> Generate API documentation from the code
> Create a README for this module
> Add JSDoc comments to all functions
```

---

## Common Workflows

### Morning Standup
```bash
> Show me what changed yesterday
> List my open pull requests
> Show TODOs assigned to me
```

### Code Cleanup
```bash
> Find all console.log statements
> Remove unused imports
> Fix linting errors
> Update deprecated dependencies
```

### Bug Fixing
```bash
> Find where error X occurs
> Show me the stack trace
> Suggest fixes for this bug
> Create a test that reproduces the issue
```

### Refactoring
```bash
> /feature-dev Refactor authentication to use OAuth
> Show me all files that need changes
> Update incrementally with tests
> /pr-review-toolkit:review-pr simplify
```

---

## Next Steps

- **Explore more plugins:** See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
- **Create your own:** Use `/plugin-dev:create-plugin`
- **Join community:** https://anthropic.com/discord
- **Read docs:** https://code.claude.com/docs

---

**Happy coding with Claude!** 🚀
