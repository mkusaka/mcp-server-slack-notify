# @mkusaka/mcp-server-slack-notify

MCP server for sending notifications to Slack using OAuth bot tokens.

## Features

- Send formatted messages to Slack channels with title and description
- Mention specific users automatically with the mention parameter
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

### Creating a Slack App

1. **Create a new Slack app**
   - Go to https://api.slack.com/apps
   - Click "Create New App"
   - Choose "From scratch"
   - Enter your app name (e.g., "MCP Notification Bot")
   - Select your workspace
   - Click "Create App"

2. **Configure OAuth scopes**
   - In your app settings, navigate to "OAuth & Permissions" in the sidebar
   - Scroll down to "Scopes" section
   - Under "Bot Token Scopes", click "Add an OAuth Scope"
   - Add the following scope:
     - `chat:write` - Required for sending messages

3. **Install the app to your workspace**
   - Stay on the "OAuth & Permissions" page
   - Click "Install to Workspace" at the top
   - Review the permissions and click "Allow"
   - You'll be redirected back to the OAuth & Permissions page

4. **Get your Bot Token**
   - After installation, you'll see a "Bot User OAuth Token" on the OAuth & Permissions page
   - It starts with `xoxb-`
   - Copy this token - you'll need it for the `SLACK_BOT_TOKEN` environment variable

5. **Invite the bot to channels**
   - In Slack, go to the channel where you want to send notifications
   - Type `/invite @YourBotName` (replace with your bot's name)
   - Or click the channel name → "Integrations" tab → "Add apps" → Select your bot

### Environment Variables

Set the following environment variables:

- `SLACK_BOT_TOKEN` (required): Your Bot User OAuth Token from step 4
- `SLACK_DEFAULT_CHANNEL` (optional): Default channel for notifications (e.g., `#general`)

## Usage with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "slack-notify": {
      "command": "npx",
      "args": ["-y", "@mkusaka/mcp-server-slack-notify@latest"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here",
        "SLACK_DEFAULT_CHANNEL": "#general"
      }
    }
  }
}
```

## Usage with Claude Code

You can add this MCP server to Claude Code using the following command:

```bash
claude mcp add slack-notify -e SLACK_BOT_TOKEN=xoxb-your-token-here -e SLACK_DEFAULT_CHANNEL=#general -- npx -y @mkusaka/mcp-server-slack-notify@latest
```

Or if you have the package installed globally:

```bash
# Install globally first
npm install -g @mkusaka/mcp-server-slack-notify

# Then add to Claude Code
claude mcp add slack-notify -e SLACK_BOT_TOKEN=xoxb-your-token-here -e SLACK_DEFAULT_CHANNEL=#general -- mcp-server-slack-notify
```

To add with user scope (available across all projects):

```bash
claude mcp add --scope user slack-notify -e SLACK_BOT_TOKEN=xoxb-your-token-here -e SLACK_DEFAULT_CHANNEL=#general -- npx -y @mkusaka/mcp-server-slack-notify@latest
```

## Available Tools

### send_slack_notification

Sends a notification to a Slack channel.

Parameters:
- `channel` (optional): The Slack channel (e.g., #general or C1234567890)
- `title` (optional): The notification title (if provided, displays with header formatting)
- `description` (required): The notification body (supports Slack markdown)
- `mention` (optional): User ID(s) to mention. Can be a single user ID (e.g., U1234567890) or multiple IDs separated by commas (e.g., U1234567890,U0987654321)

### Formatting Guide

The description field supports Slack's mrkdwn formatting:

- **Mentions:**
  - User: `<@U1234567890>` (use the user's ID)
  - Channel: `<#C1234567890>` (use the channel's ID)
  - @here: `<!here>`
  - @channel: `<!channel>`
  - User groups: `<!subteam^S1234567890>` (use the subteam's ID)
  - **Note:** When using the `mention` parameter, user mentions are automatically added at the beginning of the message
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