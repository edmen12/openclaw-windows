import type { Bot } from "grammy";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createTelegramDraftStream = vi.hoisted(() => vi.fn());
const dispatchReplyWithBufferedBlockDispatcher = vi.hoisted(() => vi.fn());
const deliverReplies = vi.hoisted(() => vi.fn());
const isOpencodeProcessAlive = vi.hoisted(() => vi.fn());
const sendToOpencodeProcess = vi.hoisted(() => vi.fn());
const loadSessionStore = vi.hoisted(() => vi.fn(() => ({})));
const resolveStorePath = vi.hoisted(() => vi.fn(() => "/tmp/store.json"));

vi.mock("./draft-stream.js", () => ({
  createTelegramDraftStream,
}));

vi.mock("../auto-reply/reply/provider-dispatcher.js", () => ({
  dispatchReplyWithBufferedBlockDispatcher,
}));

vi.mock("./bot/delivery.js", () => ({
  deliverReplies,
}));

vi.mock("./sticker-cache.js", () => ({
  cacheSticker: vi.fn(),
  describeStickerImage: vi.fn(),
}));

vi.mock("../agents/opencode-process.js", () => ({
  isOpencodeProcessAlive,
  sendToOpencodeProcess,
}));

vi.mock("../config/sessions.js", () => ({
  loadSessionStore,
  resolveStorePath,
}));

import { dispatchTelegramMessage } from "./bot-message-dispatch.js";

describe("dispatchTelegramMessage opencode routing", () => {
  beforeEach(() => {
    createTelegramDraftStream.mockReset();
    dispatchReplyWithBufferedBlockDispatcher.mockReset();
    deliverReplies.mockReset();
    isOpencodeProcessAlive.mockReset();
    sendToOpencodeProcess.mockReset();
    loadSessionStore.mockReset();
    resolveStorePath.mockReset();
  });

  it("routes to opencode when process is active", async () => {
    isOpencodeProcessAlive.mockReturnValue(true);
    loadSessionStore.mockReturnValue({
      "telegram:123": { opencodePid: 456, opencodeWorkingDir: "C:/workspace" },
    });
    sendToOpencodeProcess.mockResolvedValue("OpenCode response");

    const context = {
      ctxPayload: { Body: "write a function" },
      primaryCtx: { message: { chat: { id: 123, type: "private" } } },
      msg: {
        chat: { id: 123, type: "private" },
        message_id: 456,
      },
      chatId: 123,
      isGroup: false,
      resolvedThreadId: undefined,
      threadSpec: { id: undefined },
      historyKey: undefined,
      historyLimit: 0,
      groupHistories: new Map(),
      route: { agentId: "default", accountId: "default" },
      skillFilter: undefined,
      sendTyping: vi.fn(),
      sendRecordVoice: vi.fn(),
      ackReactionPromise: null,
      reactionApi: null,
      removeAckAfterReply: false,
    };

    const bot = {} as unknown as Bot;
    const runtime = { log: vi.fn(), error: vi.fn(), exit: () => {} };

    await dispatchTelegramMessage({
      context,
      bot,
      cfg: {},
      runtime,
      replyToMode: "first",
      streamMode: "partial",
      textLimit: 4096,
      telegramCfg: {},
      opts: { token: "token" },
      resolveBotTopicsEnabled: vi.fn().mockResolvedValue(false),
    });

    // Should NOT call dispatcher (bypass agent)
    expect(dispatchReplyWithBufferedBlockDispatcher).not.toHaveBeenCalled();
    // Should call opencode
    expect(sendToOpencodeProcess).toHaveBeenCalledWith(456, "write a function");
    // Should deliver opencode response
    expect(deliverReplies).toHaveBeenCalledWith(
      expect.objectContaining({
        replies: [{ text: "OpenCode response" }],
      }),
    );
  });

  it("skips opencode routing when no active process", async () => {
    isOpencodeProcessAlive.mockReturnValue(false);
    loadSessionStore.mockReturnValue({});

    const context = {
      ctxPayload: { Body: "write a function" },
      primaryCtx: { message: { chat: { id: 123, type: "private" } } },
      msg: {
        chat: { id: 123, type: "private" },
        message_id: 456,
      },
      chatId: 123,
      isGroup: false,
      resolvedThreadId: undefined,
      threadSpec: { id: undefined },
      historyKey: undefined,
      historyLimit: 0,
      groupHistories: new Map(),
      route: { agentId: "default", accountId: "default" },
      skillFilter: undefined,
      sendTyping: vi.fn(),
      sendRecordVoice: vi.fn(),
      ackReactionPromise: null,
      reactionApi: null,
      removeAckAfterReply: false,
    };

    const bot = {} as unknown as Bot;
    const runtime = { log: vi.fn(), error: vi.fn(), exit: () => {} };

    dispatchReplyWithBufferedBlockDispatcher.mockImplementation(
      async ({ dispatcherOptions }) => {
        await dispatcherOptions.deliver({ text: "Agent response" }, { kind: "final" });
        return { queuedFinal: true };
      },
    );

    await dispatchTelegramMessage({
      context,
      bot,
      cfg: {},
      runtime,
      replyToMode: "first",
      streamMode: "partial",
      textLimit: 4096,
      telegramCfg: {},
      opts: { token: "token" },
      resolveBotTopicsEnabled: vi.fn().mockResolvedValue(false),
    });

    // Should NOT call opencode
    expect(sendToOpencodeProcess).not.toHaveBeenCalled();
    // Should call agent dispatcher
    expect(dispatchReplyWithBufferedBlockDispatcher).toHaveBeenCalled();
  });

  it("delivers opencode error message on failure", async () => {
    isOpencodeProcessAlive.mockReturnValue(true);
    loadSessionStore.mockReturnValue({
      "telegram:123": { opencodePid: 456, opencodeWorkingDir: "C:/workspace" },
    });
    sendToOpencodeProcess.mockRejectedValue(new Error("OpenCode process dead"));

    const context = {
      ctxPayload: { Body: "write a function" },
      primaryCtx: { message: { chat: { id: 123, type: "private" } } },
      msg: {
        chat: { id: 123, type: "private" },
        message_id: 456,
      },
      chatId: 123,
      isGroup: false,
      resolvedThreadId: undefined,
      threadSpec: { id: undefined },
      historyKey: undefined,
      historyLimit: 0,
      groupHistories: new Map(),
      route: { agentId: "default", accountId: "default" },
      skillFilter: undefined,
      sendTyping: vi.fn(),
      sendRecordVoice: vi.fn(),
      ackReactionPromise: null,
      reactionApi: null,
      removeAckAfterReply: false,
    };

    const bot = {} as unknown as Bot;
    const runtime = { log: vi.fn(), error: vi.fn(), exit: () => {} };

    await dispatchTelegramMessage({
      context,
      bot,
      cfg: {},
      runtime,
      replyToMode: "first",
      streamMode: "partial",
      textLimit: 4096,
      telegramCfg: {},
      opts: { token: "token" },
      resolveBotTopicsEnabled: vi.fn().mockResolvedValue(false),
    });

    expect(deliverReplies).toHaveBeenCalledWith(
      expect.objectContaining({
        replies: expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining("OpenCode 错误"),
          }),
        ]),
      }),
    );
  });
});
