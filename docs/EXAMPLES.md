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

## Enterprise AI Agents

The repository includes 10 production-ready enterprise AI agents that can be used standalone via CLI. Each agent has multiple modes and follows a multi-stage pipeline architecture.

### Quick Start with Enterprise Agents

All agents follow the same basic usage pattern:

```bash
# Navigate to an agent directory
cd agents/<agent-name>

# Install dependencies (first time only)
npm install

# Configure API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run with default mode
npm start "Your Topic Here"

# Run with specific mode
npm start -- --mode <mode-name> "Your Topic"

# Run with additional context
npm start -- --mode <mode-name> "Topic" --context "Additional details"
```

### HR Agent

**Purpose:** Employee relations, policy guidance, and onboarding support

#### Test Prompts

```bash
cd agents/hr-agent

# Policy mode (default)
npm start "What is the work from home policy?"
npm start "How many vacation days do I get?"
npm start "What is the sick leave policy for parental leave?"

# Benefits mode
npm start -- --mode benefits "What health insurance options are available?"
npm start -- --mode benefits "When can I enroll in 401k?"
npm start -- --mode benefits "What are the dental coverage tiers?"

# Engagement mode
npm start -- --mode engagement "Analyze Q4 employee engagement results"
npm start -- --mode engagement "What are the main themes in our latest survey?"

# Onboarding mode
npm start -- --mode onboarding "New software engineer joining cloud team"
npm start -- --mode onboarding "Senior product manager starting March 2025"

# Exit interview mode
npm start -- --mode exit-interview "Summarize exit interview trends Q3-Q4"
npm start -- --mode exit-interview "Why are engineers leaving?"
```

#### Expected Output

```
=== EXECUTIVE SUMMARY ===
HR RESPONSE - POLICY

Query: What is the work from home policy?
Mode: policy
Generated: 2026-02-06T10:30:00.000Z

--- RESPONSE ---

Based on company policy document WFH-2024-v3, employees may work from home 
up to 3 days per week with manager approval. Here's what you need to know:

ELIGIBILITY:
• Full-time employees after probation period (90 days)
• Role must be suitable for remote work
• Manager discretion applies

REQUIREMENTS:
• Submit WFH request via HR portal
• Maintain availability during core hours (10am-4pm)
• Attend all mandatory in-person meetings
• Ensure adequate home internet (min 50 Mbps)

HOW TO APPLY:
1. Log into HR portal (hr.company.com)
2. Navigate to "Work Arrangements" 
3. Submit WFH request form
4. Await manager approval (typically 2-3 business days)

ESCALATION:
If you have questions about eligibility or need exceptions, contact your 
HR Business Partner or email hr-support@company.com.

DISCLAIMER: This is guidance based on current policy. For binding 
interpretations, consult with HR directly.

--- OUTPUT SAVED ---
✓ output/2026-02-06-1030_hr-policy_work-from-home.txt
✓ output/2026-02-06-1030_hr-policy_work-from-home.json
```

---

### Marketing Agent

**Purpose:** Enterprise marketing content generation

#### Test Prompts

```bash
cd agents/marketing-agent

# Blog mode (default)
npm start "AI in Enterprise Digital Transformation"
npm start "Zero Trust Security Architecture for Financial Services"

# Social mode
npm start -- --mode social "Cloud Security Trends 2025"
npm start -- --mode social "Sustainable IT Infrastructure"

# Campaign mode
npm start -- --mode campaign "Hybrid Cloud Migration Services Launch"
npm start -- --mode campaign "AI-Powered Customer Service Platform"

# Press release mode
npm start -- --mode press-release "Partnership with Microsoft Azure"
npm start -- --mode press-release "Q1 2025 Financial Results"

# Newsletter mode
npm start -- --mode newsletter "January Tech Insights - AI and Automation"
npm start -- --mode newsletter "Q4 Product Updates and Customer Success Stories"
```

#### Expected Output

```
=== EXECUTIVE SUMMARY ===
GENERATED CONTENT - BLOG

Topic: AI in Enterprise Digital Transformation
Mode: blog
Generated: 2026-02-06T11:15:00.000Z

--- CONTENT ---

# AI-Powered Digital Transformation: How Enterprises Are Scaling 
Intelligent Automation in 2025

In the rapidly evolving landscape of enterprise technology, artificial 
intelligence has emerged as the cornerstone of digital transformation...

[2,500-word article with:
- Executive summary
- Market statistics and trends
- Real-world case studies
- Technical implementation approaches
- ROI analysis
- Future outlook]

**SEO Keywords:** AI digital transformation, enterprise automation, 
intelligent systems, business process automation

**Meta Description:** Discover how enterprises achieve 40% productivity 
gains through AI-powered digital transformation. Real strategies, case 
studies, and ROI analysis.

**Suggested CTAs:**
• Schedule a Digital Transformation Assessment
• Download: AI Implementation Playbook
• Watch: Customer Success Webinar

--- OUTPUT SAVED ---
✓ output/2026-02-06-1115_marketing-blog_ai-digital-transformation.txt
✓ output/2026-02-06-1115_marketing-blog_ai-digital-transformation.json
```

---

### Recruitment Agent

**Purpose:** Hiring support with built-in bias detection

#### Test Prompts

```bash
cd agents/recruitment-agent

# Job description mode (default)
npm start "Senior Cloud Solutions Architect"
npm start "DevOps Engineer with Kubernetes experience"

# Screening mode
npm start -- --mode screening "Full Stack Developer - React and Node.js"
npm start -- --mode screening "Data Engineer with Azure experience"

# Interview mode
npm start -- --mode interview "Data Science Lead - ML Engineering"
npm start -- --mode interview "Senior Product Manager - B2B SaaS"

# Comparison mode
npm start -- --mode comparison "3 finalists for VP Engineering role"
npm start -- --mode comparison "Compare candidates for Marketing Director"

# Offer mode
npm start -- --mode offer "Senior Software Engineer - London office"
npm start -- --mode offer "Principal Architect - Remote position"
```

#### Expected Output

```
=== EXECUTIVE SUMMARY ===
RECRUITMENT CONTENT - JD

Topic: Senior Cloud Solutions Architect
Mode: jd
Generated: 2026-02-06T14:20:00.000Z

--- JOB DESCRIPTION ---

SENIOR CLOUD SOLUTIONS ARCHITECT

ABOUT THE ROLE
We're seeking an experienced Cloud Solutions Architect to design and 
implement scalable, secure cloud architectures for our enterprise clients...

RESPONSIBILITIES
• Design multi-cloud architectures (AWS, Azure, GCP)
• Lead technical discovery and solution design workshops
• Create architecture documentation and technical proposals
• Mentor junior architects and engineering teams
• Establish cloud governance and best practices

REQUIRED QUALIFICATIONS
• 7+ years in cloud architecture and infrastructure design
• Deep experience with AWS, Azure, or GCP
• Strong knowledge of containerization (Docker, Kubernetes)
• Infrastructure as Code (Terraform, CloudFormation)
• Cloud security and compliance frameworks

PREFERRED QUALIFICATIONS
• Multi-cloud certifications (AWS SA Professional, Azure Architect)
• Experience with FinOps and cost optimization
• Background in enterprise sales or client-facing roles

COMPENSATION
• Competitive salary: $140,000 - $180,000 (based on experience)
• Annual bonus up to 20%
• Equity package
• Comprehensive benefits

--- BIAS & COMPLIANCE CHECK ---
✓ No gendered language detected
✓ No age-indicative terms found
✓ Equal opportunity statement included
✓ Accessibility considerations mentioned
✓ GDPR-compliant data handling
⚠️ Consider adding: remote work flexibility, learning budget

--- OUTPUT SAVED ---
✓ output/2026-02-06-1420_recruitment-jd_senior-cloud-architect.txt
✓ output/2026-02-06-1420_recruitment-jd_senior-cloud-architect.json
```

---

### IT Operations Agent

**Purpose:** Infrastructure management and incident response

#### Test Prompts

```bash
cd agents/it-operations-agent

# Incident mode (default)
npm start "Production API returning 500 errors intermittently"
npm start "Database connection pool exhaustion"

# Monitoring mode
npm start -- --mode monitoring "Set up alerts for microservices architecture"
npm start -- --mode monitoring "Create SLA dashboard for customer-facing services"

# Automation mode
npm start -- --mode automation "Automate SSL certificate renewal"
npm start -- --mode automation "Create backup and restore scripts for PostgreSQL"

# Documentation mode
npm start -- --mode documentation "Write runbook for database failover"
npm start -- --mode documentation "Create incident response playbook"
```

#### Expected Output

```
=== INCIDENT RESPONSE PLAN ===

ISSUE: Production API returning 500 errors intermittently

SEVERITY: P1 (Critical - Production Impact)

IMMEDIATE ACTIONS (0-15 minutes):
1. Check application logs: `kubectl logs -n prod api-deployment --tail=100`
2. Verify pod health: `kubectl get pods -n prod | grep api`
3. Check resource usage: `kubectl top pods -n prod`
4. Review recent deployments: `kubectl rollout history deployment/api -n prod`

INVESTIGATION (15-60 minutes):
1. Analyze error patterns in logs
2. Check database connection pool status
3. Review external API dependencies
4. Examine memory/CPU metrics in Grafana
5. Check rate limiting and throttling

PROBABLE CAUSES:
• Database connection pool exhaustion
• Memory leak in recent deployment
• Downstream API timeout
• Cache invalidation issues

RESOLUTION STEPS:
1. If recent deployment: `kubectl rollback deployment/api -n prod`
2. If DB connections: Scale up connection pool or restart pods
3. If memory leak: Restart pods with rolling update
4. Enable debug logging for deeper investigation

PREVENTION:
• Add connection pool monitoring
• Implement circuit breakers for external APIs
• Set up memory usage alerts
• Add automated health checks

--- OUTPUT SAVED ---
✓ output/2026-02-06-0915_it-ops-incident_api-500-errors.txt
```

---

### Presales Agent

**Purpose:** Proposal generation and competitive analysis

#### Test Prompts

```bash
cd agents/presales-agent

# Proposal mode (default)
npm start "Cloud migration services for financial institution"
npm start "AI-powered customer service platform proposal"

# Competitor mode
npm start -- --mode competitor "Compare our cloud offering vs AWS and Azure"
npm start -- --mode competitor "Competitive analysis: Salesforce vs our CRM"

# RFP mode
npm start -- --mode rfp "Government agency cloud infrastructure RFP"
npm start -- --mode rfp "Healthcare data analytics platform tender"

# Pitch deck mode
npm start -- --mode pitch-deck "Series B fundraising deck for SaaS platform"
npm start -- --mode pitch-deck "Enterprise sales pitch for AI platform"

# Win-loss mode
npm start -- --mode win-loss "Analyze deals won and lost in Q4 2024"
```

#### Expected Output

```
=== TECHNICAL PROPOSAL ===

CLIENT: Financial Institution - Cloud Migration Services
Generated: 2026-02-06T16:45:00.000Z

EXECUTIVE SUMMARY
We propose a phased cloud migration strategy leveraging our proven 
6R methodology to modernize your infrastructure while ensuring 
compliance with financial regulations...

[Full proposal includes:
- Situation analysis
- Proposed solution architecture
- Implementation timeline (12-18 months)
- Team structure and roles
- Risk mitigation strategy
- Pricing: $2.4M - $3.1M
- Success metrics and KPIs]

--- OUTPUT SAVED ---
✓ output/2026-02-06-1645_presales-proposal_cloud-migration.txt
```

---

### Learning & Development Agent

**Purpose:** Training and skill development planning

#### Test Prompts

```bash
cd agents/learning-dev-agent

# Skill gap mode (default)
npm start "Frontend team needs to learn TypeScript and Next.js"
npm start "Sales team lacks technical knowledge for enterprise deals"

# Learning path mode
npm start -- --mode learning-path "Junior developer to senior engineer"
npm start -- --mode learning-path "Product manager to technical PM"

# Training mode
npm start -- --mode training "Cloud security workshop for engineering team"
npm start -- --mode training "Leadership training for first-time managers"

# Assessment mode
npm start -- --mode assessment "Test React knowledge for mid-level developers"

# Team matrix mode
npm start -- --mode team-matrix "Skill inventory for 15-person engineering team"
```

---

### LinkedIn Content Generator

**Purpose:** Professional LinkedIn content creation

#### Test Prompts

```bash
cd agents/linkedin-content-generator

npm start "AI and the future of work"
npm start "Building high-performing engineering teams"
npm start "Cloud cost optimization strategies"
npm start "The importance of technical documentation"
```

#### Expected Output

```
=== LINKEDIN CONTENT ===

Topic: AI and the future of work
Generated: 2026-02-06T09:30:00.000Z

--- POST VARIATION 1 (Hook-Focused) ---

🤖 AI won't replace your job. But someone using AI probably will.

Here's what 5 years of implementing AI in enterprises taught me:

[1,200 character post with:
- Attention-grabbing hook
- Personal story or data point
- 3-5 key insights
- Call to action
- Relevant hashtags]

--- POST VARIATION 2 (Value-Focused) ---

After helping 50+ companies implement AI, here are the 5 skills that will 
matter most in 2025:

[Educational thread-style post with:
- Clear value proposition
- Numbered insights
- Practical examples
- Resources or next steps]

--- IMAGE SUGGESTIONS ---
• Infographic: Skills needed for AI era
• Photo: Team collaboration with AI tools
• Chart: AI adoption statistics

--- OPTIMAL POSTING SCHEDULE ---
• Best days: Tuesday, Wednesday, Thursday
• Best times: 7-9 AM, 12-1 PM, 5-6 PM EST
• Avoid: Monday mornings, Friday afternoons

--- OUTPUT SAVED ---
✓ output/2026-02-06-0930_linkedin_ai-future-of-work.txt
```

---

### Sustainability Agent

**Purpose:** IT sustainability and carbon footprint analysis

#### Test Prompts

```bash
cd agents/sustainability-agent

# Carbon footprint mode (default)
npm start "Calculate cloud infrastructure carbon emissions"
npm start "Data center Scope 1, 2, 3 emissions analysis"

# Green IT mode
npm start -- --mode green-it "Optimize data center energy efficiency"
npm start -- --mode green-it "Reduce cloud compute carbon footprint"

# Sustainability report mode
npm start -- --mode sustainability-report "Annual ESG report for IT operations"
npm start -- --mode sustainability-report "CDP Climate disclosure preparation"

# Energy optimization mode
npm start -- --mode energy-optimization "Renewable energy integration strategy"

# ESG compliance mode
npm start -- --mode esg-compliance "EU CSRD compliance assessment"
```

---

### Accessibility Agent

**Purpose:** Digital accessibility auditing and WCAG compliance

#### Test Prompts

```bash
cd agents/accessibility-agent

# WCAG audit mode (default)
npm start "Audit e-commerce website for WCAG 2.1 AA compliance"
npm start "Review mobile app accessibility"

# Remediation plan mode
npm start -- --mode remediation-plan "Fix accessibility issues in admin dashboard"

# Alt text mode
npm start -- --mode alt-text "Generate alt text for product images"

# ARIA review mode
npm start -- --mode aria-review "Review form accessibility implementation"

# Compliance report mode
npm start -- --mode compliance-report "VPAT 2.4 Rev 508 documentation"
```

---

### Cloud Operations Agent

**Purpose:** Multi-cloud operations and FinOps

#### Test Prompts

```bash
cd agents/cloud-ops-agent

# Cost optimization mode (default)
npm start "Reduce AWS spend by 30% without impacting performance"
npm start "Azure cost analysis and savings recommendations"

# Incident response mode
npm start -- --mode incident-response "Multi-region outage postmortem"

# Capacity planning mode
npm start -- --mode capacity-planning "Scale infrastructure for 300% growth"

# Architecture review mode
npm start -- --mode architecture-review "Well-Architected Framework assessment"

# Migration assessment mode
npm start -- --mode migration-assessment "On-prem to AWS migration strategy"
```

---

### Common Enterprise Agent Workflows

#### 1. Complete Recruitment Cycle
```bash
cd agents/recruitment-agent

# Step 1: Create job description
npm start -- --mode jd "Senior DevOps Engineer"

# Step 2: Create screening framework
npm start -- --mode screening "Senior DevOps Engineer"

# Step 3: Generate interview questions
npm start -- --mode interview "Senior DevOps Engineer"

# Step 4: Compare finalists
npm start -- --mode comparison "3 DevOps candidates from final round"

# Step 5: Draft offer letter
npm start -- --mode offer "Senior DevOps Engineer - NYC office"
```

#### 2. Marketing Campaign Launch
```bash
cd agents/marketing-agent

# Step 1: Blog article
npm start -- --mode blog "New AI Platform Launch"

# Step 2: Social media calendar
npm start -- --mode social "AI Platform Launch Week"

# Step 3: Press release
npm start -- --mode press-release "AI Platform Now Available"

# Step 4: Newsletter
npm start -- --mode newsletter "Introducing Our AI Platform"
```

#### 3. IT Incident Management
```bash
cd agents/it-operations-agent

# Step 1: Incident response
npm start -- --mode incident "Production database connection failures"

# Step 2: Create monitoring
npm start -- --mode monitoring "Database health monitoring setup"

# Step 3: Automation
npm start -- --mode automation "Auto-restart failed database connections"

# Step 4: Documentation
npm start -- --mode documentation "Database incident response playbook"
```

---

### Testing & Validation

#### Verify Agent Output

```bash
# Check output directory
ls -la agents/<agent-name>/output/

# View text output
cat agents/<agent-name>/output/<filename>.txt

# Parse JSON output
cat agents/<agent-name>/output/<filename>.json | jq '.'

# Check specific fields in JSON
cat agents/<agent-name>/output/<filename>.json | jq '.mode, .generatedAt'
```

#### Validate Agent Behavior

**1. Check Pipeline Execution:**
```bash
npm start "test topic" 2>&1 | grep "Stage:"
# Should show all stages executing: Classification → Research → Generation → Review
```

**2. Verify Budget Limits:**
```bash
npm start "complex topic" 2>&1 | grep "budget"
# Should respect max turn and budget limits
```

**3. Test Error Handling:**
```bash
# Missing API key
unset ANTHROPIC_API_KEY
npm start "test"
# Should show clear error message

# Invalid mode
npm start -- --mode invalid "test"
# Should list valid modes
```

**4. Output Validation:**
```bash
# Check file creation
test -f output/$(ls -t output/ | head -1) && echo "✓ Output created"

# Validate JSON structure
cat output/$(ls -t output/*.json | head -1) | jq 'has("topic", "mode", "generatedAt")' 
# Should return: true
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
