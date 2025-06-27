import { describe, it, expect, beforeEach, vi } from "vitest";
import { SlackClient } from "../lib/slack-client.js";
import { WebClient } from "@slack/web-api";
import { createMockWebClient } from "./test-utils.js";

vi.mock("@slack/web-api");

describe("SlackClient", () => {
  let slackClient: SlackClient;
  let mockWebClient: ReturnType<typeof createMockWebClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebClient = createMockWebClient();

    vi.mocked(WebClient).mockImplementation(() => {
      const client = Object.create(WebClient.prototype);
      client.chat = { postMessage: mockWebClient.mockPostMessage };
      client.auth = { test: mockWebClient.mockAuthTest };
      return client;
    });

    slackClient = new SlackClient({
      token: "xoxb-test-token",
      defaultChannel: "#general",
    });
  });

  describe("sendMessage", () => {
    it("should send a message with title and description", async () => {
      const message = {
        channel: "#test-channel",
        title: "Test Title",
        description: "Test description with *markdown*",
      };

      const result = await slackClient.sendMessage(message);

      expect(result).toBe("1234567890.123456");
      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith({
        channel: "#test-channel",
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: "header",
            text: expect.objectContaining({
              text: "Test Title",
            }),
          }),
          expect.objectContaining({
            type: "divider",
          }),
          expect.objectContaining({
            type: "section",
            text: expect.objectContaining({
              text: "Test description with *markdown*",
            }),
          }),
        ]),
        text: "Test Title",
      });
    });

    it("should create blocks with header and divider when title is provided", async () => {
      const message = {
        channel: "#test-channel",
        title: "Test Title",
        description: "Test description",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "header",
            }),
            expect.objectContaining({
              type: "divider",
            }),
            expect.objectContaining({
              type: "section",
            }),
          ]),
        }),
      );
    });

    it("should use default channel when no channel specified", async () => {
      const message = {
        channel: "",
        title: "Test Title",
        description: "Test description",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "#general",
        }),
      );
    });

    it("should add mentions to the beginning of the message", async () => {
      const message = {
        channel: "#test-channel",
        title: "Test Title",
        description: "Test description",
        mention: "U1234567890",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "section",
              text: expect.objectContaining({
                text: "<@U1234567890> Test description",
              }),
            }),
          ]),
        }),
      );
    });

    it("should handle multiple mentions separated by commas", async () => {
      const message = {
        channel: "#test-channel",
        description: "Important message",
        mention: "U1234567890,U0987654321,U1111111111",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "section",
              text: expect.objectContaining({
                text: "<@U1234567890> <@U0987654321> <@U1111111111> Important message",
              }),
            }),
          ]),
        }),
      );
    });

    it("should handle mentions with spaces around commas", async () => {
      const message = {
        channel: "#test-channel",
        description: "Message with mentions",
        mention: "U1234567890, U0987654321 , U1111111111",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "section",
              text: expect.objectContaining({
                text: "<@U1234567890> <@U0987654321> <@U1111111111> Message with mentions",
              }),
            }),
          ]),
        }),
      );
    });

    it("should use default mentions from config when no mention parameter provided", async () => {
      slackClient = new SlackClient({
        token: "xoxb-test-token",
        defaultChannel: "#general",
        mentions: "U1234567890,U0987654321",
      });

      const message = {
        channel: "#test-channel",
        description: "Important message",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "section",
              text: expect.objectContaining({
                text: "<@U1234567890> <@U0987654321> Important message",
              }),
            }),
          ]),
        }),
      );
    });

    it("should override default mentions when mention parameter is provided", async () => {
      slackClient = new SlackClient({
        token: "xoxb-test-token",
        defaultChannel: "#general",
        mentions: "U1234567890,U0987654321",
      });

      const message = {
        channel: "#test-channel",
        description: "Important message",
        mention: "U9999999999",
      };

      await slackClient.sendMessage(message);

      expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "section",
              text: expect.objectContaining({
                text: "<@U9999999999> Important message",
              }),
            }),
          ]),
        }),
      );
    });

    it("should throw error when no channel specified and no default", async () => {
      slackClient = new SlackClient({
        token: "xoxb-test-token",
      });

      const message = {
        channel: "",
        title: "Test Title",
        description: "Test description",
      };

      await expect(slackClient.sendMessage(message)).rejects.toThrow(
        "No channel specified and no default channel configured",
      );
    });

    it("should handle API errors", async () => {
      mockWebClient.mockPostMessage.mockRejectedValueOnce(
        new Error("API Error"),
      );

      const message = {
        channel: "#test-channel",
        title: "Test Title",
        description: "Test description",
      };

      await expect(slackClient.sendMessage(message)).rejects.toThrow(
        "Failed to send Slack message: API Error",
      );
    });
  });

  describe("testConnection", () => {
    it("should return true when connection is successful", async () => {
      const result = await slackClient.testConnection();

      expect(result).toBe(true);
      expect(mockWebClient.mockAuthTest).toHaveBeenCalled();
    });

    it("should return false when connection fails", async () => {
      mockWebClient.mockAuthTest.mockRejectedValueOnce(
        new Error("Auth failed"),
      );

      const result = await slackClient.testConnection();

      expect(result).toBe(false);
    });
  });
});
