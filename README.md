# @mkusaka/mcp-server-slack-notify

MCP server for sending notifications to Slack using OAuth bot tokens.

## Features

- Send formatted messages to Slack channels with title and description
- Support for Slack's markdown formatting
- Clean message formatting with optional header
- TypeScript support with full type safety

## Installation

```bash
npm install @mkusaka/mcp-server-slack-notify
# or
pnpm add @mkusaka/mcp-server-slack-notify
```

## Configuration

The server requires a Slack Bot User OAuth Token. You need to:

1. Create a Slack app at https://api.slack.com/apps
2. Add OAuth scopes: `chat:write` (required) and `auth:test` (for connection testing)
3. Install the app to your workspace
4. Get the Bot User OAuth Token (starts with `xoxb-`)

Set the following environment variables:

- `SLACK_BOT_TOKEN` (required): Your Slack Bot User OAuth Token
- `SLACK_DEFAULT_CHANNEL` (optional): Default channel for notifications

## Usage with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "slack-notify": {
      "command": "npx",
      "args": ["@mkusaka/mcp-server-slack-notify"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here",
        "SLACK_DEFAULT_CHANNEL": "#general"
      }
    }
  }
}
```

## Available Tools

### send_slack_notification

Sends a notification to a Slack channel.

Parameters:
- `channel` (optional): The Slack channel (e.g., #general or C1234567890)
- `title` (optional): The notification title (if provided, displays with header formatting)
- `description` (required): The notification body (supports Slack markdown)

### Formatting Guide

The description field supports Slack's mrkdwn formatting:

- **Mentions:**
  - User: `<@U1234567890>` (use the user's ID)
  - Channel: `<#C1234567890>` (use the channel's ID)
  - @here: `<!here>`
  - @channel: `<!channel>`
  - User groups: `<!subteam^S1234567890>` (use the subteam's ID)
- **Text formatting:**
  - Bold: `*bold text*`
  - Italic: `_italic text_`
  - Strikethrough: `~strikethrough text~`
  - Code: `` `inline code` ``
  - Code block: ` ```code block``` `
  - Quote: `> quoted text`
  - Link: `<https://example.com|Link text>`

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Run in development mode
pnpm start

# Debug with MCP Inspector
pnpm debug
```

## Testing

The project includes comprehensive tests using Vitest with mocked Slack API calls.

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## License

MIT