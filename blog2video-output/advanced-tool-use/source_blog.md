# Advanced Tool Use on the Claude Developer Platform

## Overview

Anthropic released three beta features enabling Claude to discover, learn, and execute tools dynamically:

1. **Tool Search Tool** - Allows Claude to search for relevant tools from thousands without consuming context
2. **Programmatic Tool Calling** - Enables Claude to orchestrate tools via code rather than sequential API calls
3. **Tool Use Examples** - Provides concrete usage patterns beyond JSON schema definitions

## Tool Search Tool

### Challenge
Tool definitions accumulate tokens rapidly. A five-server setup (GitHub, Slack, Sentry, Grafana, Splunk) consumes ~55K tokens before conversation starts. Adding Jira pushes overhead to 100K+ tokens.

### Solution
Instead of loading all definitions upfront, Claude dynamically discovers needed tools. The approach reduces token consumption from ~77K to ~8.7K—an 85% reduction. Internal testing showed accuracy improvements: Opus 4 improved from 49% to 74%, Opus 4.5 from 79.5% to 88.1%.

### Implementation
Mark tools with `defer_loading: true` to make them discoverable on-demand. When Claude searches for capabilities, only matching tools load into context.

## Programmatic Tool Calling

### Challenge
Traditional tool calling creates two problems:
- **Context pollution**: Intermediate results accumulate (2,000+ expense line items = 50KB+ in context)
- **Inference overhead**: Each tool call requires full model inference pass

### Solution
Claude writes Python code orchestrating multiple tools. Results process in a sandboxed environment rather than Claude's context. Only final output enters the model's context window.

### Benefits
- Token savings: 37% reduction (43,588 to 27,297 tokens)
- Reduced latency: Eliminates 19+ inference passes for 20+ tool calls
- Improved accuracy: Knowledge retrieval improved from 25.6% to 28.5%

## Tool Use Examples

### Challenge
JSON schemas define structure but cannot express usage patterns—when to include optional parameters, which combinations work, or API conventions.

### Solution
Provide 1-5 concrete examples showing correct parameter usage. Example demonstrates date format (YYYY-MM-DD), ID convention (USR-XXXXX), and nested structure patterns.

Internal testing showed accuracy improvement from 72% to 90% on complex parameter handling.

## Best Practices

**Layer strategically**: Start with your biggest bottleneck—context bloat, intermediate results, or parameter errors—then add features as needed.

**Tool Search Setup**: Use clear, descriptive names and descriptions. Keep 3-5 most-used tools always loaded; defer the rest.

**Programmatic Calling**: Document return formats clearly so Claude writes correct parsing logic.

**Examples**: Use realistic data, show minimal/partial/full patterns, focus on ambiguous areas.

## Getting Started

Enable via beta header with `advanced-tool-use-2025-11-20` and include appropriate tool configurations in your API requests.
