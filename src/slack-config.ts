import { z } from "zod";
import { logger } from "./lib/logger.js";

const SlackConfigSchema = z.object({
  token: z.string().min(1, "Slack token is required"),
  defaultChannel: z.string().optional(),
});

export type SlackConfig = z.infer<typeof SlackConfigSchema>;

export function getSlackConfig(): SlackConfig {
  const config = {
    token: process.env.SLACK_BOT_TOKEN || "",
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
  };

  try {
    const validated = SlackConfigSchema.parse(config);
    logger.info("Slack configuration loaded", {
      hasToken: !!validated.token,
      defaultChannel: validated.defaultChannel,
    });
    return validated;
  } catch (error) {
    logger.error("Invalid Slack configuration", { error });
    throw new Error(
      "Invalid Slack configuration. Please ensure SLACK_BOT_TOKEN environment variable is set.",
    );
  }
}
