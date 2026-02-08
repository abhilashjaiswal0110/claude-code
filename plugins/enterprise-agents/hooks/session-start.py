#!/usr/bin/env python3
"""
Session Start Hook for Enterprise Agents Plugin

Displays available agents and capabilities at the start of each Claude Code session.
"""

import json
import sys


def main():
    """Display enterprise agents welcome message."""

    welcome_message = """
╔═══════════════════════════════════════════════════════════════╗
║           🏢 Enterprise Agents Plugin Loaded                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  10 AI agents available:                                      ║
║                                                               ║
║  📋 /hr - HR policies, benefits, onboarding                   ║
║  📱 /marketing - Content creation (blog, social, campaigns)   ║
║  👔 /recruitment - Bias-free hiring, JDs, interviews          ║
║  💼 /presales - Proposals, RFPs, competitive analysis         ║
║  🖥️  /it-ops - Incident response, monitoring, automation      ║
║  📚 /learning - Training, skill gaps, learning paths          ║
║  🔗 /linkedin - Professional LinkedIn content                 ║
║  🌱 /sustainability - Carbon footprint, green IT, ESG         ║
║  ♿ /accessibility - WCAG audits, remediation, a11y           ║
║  ☁️  /cloud-ops - Cost optimization, FinOps, cloud ops        ║
║                                                               ║
║  🔗 /workflow - Multi-agent workflow orchestration            ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  Features:                                                    ║
║  ✨ Auto-detection - Agents trigger automatically             ║
║  🔗 Workflow chaining - Combine multiple agents               ║
║  🎯 Mode selection - Multiple modes per agent                 ║
║  📊 Rich outputs - JSON + formatted documents                 ║
╚═══════════════════════════════════════════════════════════════╝

💡 Tip: Just describe what you need - the plugin will suggest the right agent!

Examples:
  • "Help me write a job description" → Recruitment agent
  • "Create a blog about cloud migration" → Marketing agent
  • "What's our PTO policy?" → HR agent

Or use commands directly: /hr, /marketing, /workflow recruitment-pipeline
"""

    result = {
        "systemMessage": welcome_message.strip()
    }

    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
