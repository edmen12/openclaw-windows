/**
 * OpenCode command handlers for Telegram
 *
 * To integrate with bot-handlers.ts, add these handlers to the command routing logic:
 */

import type { TelegramContext } from "./bot/types";
import type { Message } from "@grammyjs/types";
import {
  startOpenCodeSession,
  endSession,
  sendToOpenCode,
  hasActiveSession,
} from "./opencode-manager.js";

/**
 * Check if a command should be intercepted for OpenCode mode
 * Returns true if the command should go to OpenCode instead of Eden
 */
export function shouldInterceptForOpenCode(
  text: string,
  chatId: number,
  userId: number,
): boolean {
  // Special commands that always go to Eden (even during OpenCode mode)
  if (text.trim() === "/opencode_exit") {
    return false; // Handled specially
  }

  // If OpenCode session is active, intercept ALL /commands
  return hasActiveSession(chatId, userId);
}

/**
 * Handle /opencode command - start persistent OpenCode session
 */
export async function handleOpencodeCommand(
  ctx: TelegramContext,
  chatId: number,
  userId: number,
  args?: string,
): Promise<string> {
  const workspace = args?.trim() || undefined;

  const result = await startOpenCodeSession(chatId, userId, workspace);

  if (!result.success) {
    return `❌ ${result.error}`;
  }

  return `✅ OpenCode session started${workspace ? ` (workspace: ${workspace})` : ""}

Send code requests as plain text (avoid /commands).
Use \`/opencode_exit\` to return to normal chat mode.`;
}

/**
 * Handle /opencode_exit command - end OpenCode session
 */
export function handleOpencodeExitCommand(
  chatId: number,
  userId: number,
): string {
  const success = endSession(chatId, userId);

  if (success) {
    return `✅ OpenCode session ended.

Returning to normal chat mode. Your previous context is restored.`;
  }

  return `⚠️ No active OpenCode session.`;
}

/**
 * Process message during OpenCode mode
 * Sends message to OpenCode stdin and returns output
 */
export async function processOpenCodeMessage(
  chatId: number,
  userId: number,
  message: string,
): Promise<string> {
  const result = await sendToOpenCode(chatId, userId, message);

  if (!result.success) {
    return `❌ Error: ${result.error}`;
  }

  return `**OpenCode Output:**\n\n\`\`\`\n${result.output}\n\`\`\``;
}

/**
 * Integration guide for bot-handlers.ts
 *
 * Add this to your message processing flow:
 *
 * ```typescript
 * import {
 *   shouldInterceptForOpenCode,
 *   handleOpencodeCommand,
 *   handleOpencodeExitCommand,
 *   processOpenCodeMessage,
 * } from "./opencv-handlers.js";
 *
 * // In the message handler, before Eden processing:
 * if (text.startsWith("/") && shouldInterceptForOpenCode(text, chatId, userId)) {
 *   let response: string;
 *
 *   if (text.trim() === "/opencode_exit") {
 *     response = handleOpencodeExitCommand(chatId, userId);
 *   } else {
 *     response = await processOpenCodeMessage(chatId, userId, message);
 *   }
 *
 *   await bot.api.sendMessage(chatId, response);
 *   return; // Skip Eden processing
 * }
 *
 * // Handle /opencode command (even without active session)
 * if (text.trim().startsWith("/opencode")) {
 *   const args = text.trim().slice("/opencode".length).trim();
 *   const response = await handleOpencodeCommand(ctx, chatId, userId, args);
 *   await bot.api.sendMessage(chatId, response);
 *   return; // Skip Eden processing
 * }
 *
 * // Normal Eden processing continues...
 * ```
 */
