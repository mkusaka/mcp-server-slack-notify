import { describe, it, expect, beforeEach, vi } from "vitest";
import { SlackClient } from "../lib/slack-client.js";
import { WebClient } from "@slack/web-api";
import { createMockWebClient } from "./test-utils.js";

vi.mock("@slack/web-api");

describe("SlackClient - No Title", () => {
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

  it("should send a message without title", async () => {
    const message = {
      channel: "#test-channel",
      description: "Just a description without a title",
    };

    const result = await slackClient.sendMessage(message);

    expect(result).toBe("1234567890.123456");
    expect(mockWebClient.mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "#test-channel",
        text: "Just a description without a title",
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: "section",
            text: expect.objectContaining({
              text: "Just a description without a title",
            }),
          }),
        ]),
      }),
    );

    // Should not contain header or divider
    const call = mockWebClient.mockPostMessage.mock.calls[0][0];
    expect(call.blocks).not.toContainEqual(
      expect.objectContaining({ type: "header" }),
    );
    expect(call.blocks).not.toContainEqual(
      expect.objectContaining({ type: "divider" }),
    );
  });
});