import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getSlackConfig } from "../slack-config.js";

describe("SlackConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should parse valid configuration with token and default channel", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test-token-123";
    process.env.SLACK_DEFAULT_CHANNEL = "#general";

    const config = getSlackConfig();

    expect(config).toEqual({
      token: "xoxb-test-token-123",
      defaultChannel: "#general",
      mentions: undefined,
    });
  });

  it("should parse valid configuration with token only", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test-token-123";
    delete process.env.SLACK_DEFAULT_CHANNEL;

    const config = getSlackConfig();

    expect(config).toEqual({
      token: "xoxb-test-token-123",
      defaultChannel: undefined,
      mentions: undefined,
    });
  });

  it("should parse valid configuration with all options", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test-token-123";
    process.env.SLACK_DEFAULT_CHANNEL = "#general";
    process.env.SLACK_MENTIONS = "U1234567890,U0987654321";

    const config = getSlackConfig();

    expect(config).toEqual({
      token: "xoxb-test-token-123",
      defaultChannel: "#general",
      mentions: "U1234567890,U0987654321",
    });
  });

  it("should throw error when token is missing", () => {
    delete process.env.SLACK_BOT_TOKEN;

    expect(() => getSlackConfig()).toThrow(
      "Invalid Slack configuration. Please ensure SLACK_BOT_TOKEN environment variable is set.",
    );
  });

  it("should throw error when token is empty", () => {
    process.env.SLACK_BOT_TOKEN = "";

    expect(() => getSlackConfig()).toThrow(
      "Invalid Slack configuration. Please ensure SLACK_BOT_TOKEN environment variable is set.",
    );
  });
});
