import { WebClient } from "@slack/web-api";
import type { KnownBlock } from "@slack/web-api";
import { logger } from "./logger.js";

export interface SlackClientConfig {
  token: string;
  defaultChannel?: string;
}

export interface SlackMessage {
  channel: string;
  title?: string;
  description: string;
}

export class SlackClient {
  private client: WebClient;
  private defaultChannel?: string;

  constructor(config: SlackClientConfig) {
    this.client = new WebClient(config.token);
    this.defaultChannel = config.defaultChannel;
  }

  async sendMessage(message: SlackMessage): Promise<string> {
    const channel = message.channel || this.defaultChannel;
    if (!channel) {
      throw new Error("No channel specified and no default channel configured");
    }

    try {
      logger.info("Sending message to Slack", {
        channel,
        title: message.title,
      });

      const blocks: KnownBlock[] = [];

      if (message.title) {
        blocks.push({
          type: "header",
          text: {
            type: "plain_text",
            text: message.title,
            emoji: true,
          },
        });
        blocks.push({
          type: "divider",
        });
      }

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: message.description,
        },
      });

      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Sent via MCP Server at <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} {time}|${new Date().toISOString()}>`,
          },
        ],
      });

      const result = await this.client.chat.postMessage({
        channel,
        blocks,
        text: message.title || message.description, // Fallback for notifications
      });

      logger.info("Message sent successfully", { ts: result.ts });
      return result.ts as string;
    } catch (error) {
      logger.error("Failed to send message to Slack", { error, channel });
      throw new Error(
        `Failed to send Slack message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.auth.test();
      logger.info("Slack connection test successful", {
        team: result.team,
        user: result.user,
      });
      return true;
    } catch (error) {
      logger.error("Slack connection test failed", { error });
      return false;
    }
  }
}
