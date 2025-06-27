#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logger } from "./lib/logger.js";
import { SlackClient } from "./lib/slack-client.js";
import { getSlackConfig } from "./slack-config.js";
import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
) as PackageJson;
const version = packageJson.version;

const slackConfig = getSlackConfig();
const slackClient = new SlackClient(slackConfig);

logger.info("MCP Slack Notification Server started");
logger.info(`Default channel: ${slackConfig.defaultChannel || "(not set)"}`);
logger.info(`Default mentions: ${slackConfig.mentions || "(not set)"}`);

const instructions = `
This MCP server enables sending notifications to Slack channels using a bot token.

Capabilities:
1. Send messages with a title and description to any Slack channel

Authentication:
- Requires a Slack Bot User OAuth Token set via SLACK_BOT_TOKEN environment variable
- The bot must be invited to the channels where you want to send messages

Usage:
- Use send_slack_notification to send a message to a specific channel
- The title and description support Slack's markdown formatting
- Channel can be specified as #channel-name or by channel ID

Formatting:
- To mention users: <@U1234567890> (use the user's ID)
- To mention channels: <#C1234567890> (use the channel's ID)
- To mention @here: <!here>
- To mention @channel: <!channel>
- To mention user groups: <!subteam^S1234567890> (use the subteam's ID)

Text formatting:
- Bold: *bold text*
- Italic: _italic text_
- Strikethrough: ~strikethrough text~
- Code: \`inline code\`
- Code block: \`\`\`code block\`\`\`
- Quote: > quoted text
- Link: <https://example.com|Link text>
`;

const initializeServer = (options: ServerOptions) => {
  const server = new McpServer(
    {
      name: "@mkusaka/mcp-server-slack-notify",
      version,
    },
    options,
  );

  server.tool(
    "send_slack_notification",
    "Sends a notification to a Slack channel with a title and description",
    {
      channel: z
        .string()
        .optional()
        .describe(
          "The Slack channel to send the message to (e.g., #general or C1234567890). If not provided, uses the default channel.",
        ),
      title: z.string().optional().describe("The title of the notification"),
      description: z
        .string()
        .min(1)
        .describe("The description/body of the notification"),
      mention: z
        .string()
        .optional()
        .describe(
          "User ID(s) to mention in the message. Can be a single user ID (e.g., U1234567890) or multiple IDs separated by commas (e.g., U1234567890,U0987654321)",
        ),
    },
    async ({ channel, title, description, mention }) => {
      try {
        logger.info("Sending Slack notification", { channel, title, mention });

        const messageId = await slackClient.sendMessage({
          channel: channel || "",
          title,
          description,
          mention,
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully sent notification to Slack. Message ID: ${messageId}`,
            },
          ],
        };
      } catch (error) {
        logger.error("Error sending Slack notification:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // server.tool(
  //   "test_slack_connection",
  //   "Tests the Slack connection to verify authentication is working",
  //   {},
  //   async () => {
  //     try {
  //       logger.info("Testing Slack connection");
  //       const isConnected = await slackClient.testConnection();

  //       if (isConnected) {
  //         return {
  //           content: [
  //             {
  //               type: "text",
  //               text: "Slack connection test successful. Authentication is working correctly.",
  //             },
  //           ],
  //         };
  //       } else {
  //         return {
  //           content: [
  //             {
  //               type: "text",
  //               text: "Slack connection test failed. Please check your bot token.",
  //             },
  //           ],
  //           isError: true,
  //         };
  //       }
  //     } catch (error) {
  //       logger.error("Error testing Slack connection:", error);
  //       return {
  //         content: [
  //           {
  //               type: "text",
  //               text: `Error: ${error instanceof Error ? error.message : String(error)}`,
  //             },
  //           ],
  //           isError: true,
  //         };
  //       }
  //     },
  //   );

  return server;
};

// async function testSlackConnectionOnStartup() {
//   try {
//     const isConnected = await slackClient.testConnection();
//     if (!isConnected) {
//       logger.warn(
//         "Initial Slack connection test failed. Server will still start.",
//       );
//     }
//   } catch (error) {
//     logger.warn("Could not test Slack connection on startup:", error);
//   }
// }

// testSlackConnectionOnStartup()
//   .then(() => {
const server = initializeServer({
  instructions,
});

const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {
    logger.info("MCP Slack Notification Server ready");
  })
  .catch((error) => {
    logger.error("Failed to connect server:", error);
    process.exit(1);
  });
//   })
//   .catch((error) => {
//     logger.error("Failed during startup:", error);
//     process.exit(1);
//   });
