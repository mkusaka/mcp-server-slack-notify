# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `pnpm build` - Compiles TypeScript to dist/ with executable permissions
- **Test**: `pnpm test` - Run Vitest test suite
- **Test (watch)**: `pnpm test:watch` - Run tests in watch mode  
- **Lint**: `pnpm lint` - Run ESLint on TypeScript files
- **Format**: `pnpm format` - Format code with Prettier
- **Type check**: `pnpm typecheck` - Run TypeScript compiler without emitting files
- **Start dev**: `pnpm start` - Run server directly with tsx
- **Debug**: `pnpm debug` - Build and run with MCP Inspector

## Architecture

This is an MCP (Model Context Protocol) server that enables Slack notifications. The architecture follows these patterns:

### Core Components

- **`src/index.ts`**: Main MCP server entry point that defines the `send_slack_notification` tool
- **`src/slack-config.ts`**: Configuration validation using Zod schemas for environment variables
- **`src/lib/slack-client.ts`**: Slack Web API wrapper that handles message formatting with blocks
- **`src/lib/logger.ts`**: Winston-based logging utility

### MCP Integration

The server uses `@modelcontextprotocol/sdk` to:
- Define tools with Zod schema validation
- Handle stdio transport for Claude Desktop integration
- Provide structured error responses

### Message Formatting

Messages use Slack's Block Kit with conditional formatting:
- Header block + divider if title is provided
- Section block with mrkdwn formatting for description
- Supports Slack markdown syntax for mentions, formatting, and links

### Configuration

Environment variables are validated at startup:
- `SLACK_BOT_TOKEN` (required): OAuth bot token with chat:write scope
- `SLACK_DEFAULT_CHANNEL` (optional): Default channel for notifications

### Testing

Uses Vitest with mocked Slack API calls. Tests cover:
- Message formatting with and without titles
- Channel resolution logic
- Error handling scenarios
- Configuration validation

The codebase follows TypeScript strict mode and uses ES modules with Node16 module resolution.