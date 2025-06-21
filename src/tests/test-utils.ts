import { vi } from "vitest";
import type { WebAPICallResult } from "@slack/web-api";

interface ChatPostMessageResult extends WebAPICallResult {
  ts?: string;
  channel?: string;
}

interface AuthTestResult extends WebAPICallResult {
  url?: string;
  team?: string;
  team_id?: string;
  user?: string;
  user_id?: string;
}

export function createMockWebClient() {
  const mockPostMessage = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      ts: "1234567890.123456",
      channel: "C1234567890",
    } satisfies ChatPostMessageResult),
  );

  const mockAuthTest = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      url: "https://test.slack.com",
      team: "Test Team",
      team_id: "T1234567890",
      user: "test-bot",
      user_id: "U1234567890",
    } satisfies AuthTestResult),
  );

  return {
    mockPostMessage,
    mockAuthTest,
  };
}

export function createMockSlackClient() {
  return {
    sendMessage: vi.fn().mockResolvedValue("1234567890.123456"),
    testConnection: vi.fn().mockResolvedValue(true),
  };
}
