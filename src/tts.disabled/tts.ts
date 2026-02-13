// OpenClaw TTS - 使用 qwen3-tts-local (eden_tts.py)
// 替换所有内置 TTS 实现

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 常量（仅用于兼容性，实际不使用）
export const OPENAI_TTS_MODELS = [];
export const OPENAI_TTS_VOICES = [];

export async function textToSpeech({ text, cfg, channel }) {
  // 调用 eden_tts.py
  const scriptPath = path.resolve('C:/Users/User/.openclaw/workspace/eden_tts.py');
  const python = 'python';

  try {
    const result = spawnSync(python, [scriptPath, text], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for long text
    });

    if (result.error || result.status !== 0) {
      const err = result.error || new Error('TTS script failed');
      return { success: false, error: err.message };
    }

    // eden_tts.py 输出 OGG 文件路径（最后一行）
    const lines = result.stdout.trim().split('\n');
    const audioPath = lines[lines.length - 1].trim();

    if (!audioPath || !path.exists(audioPath)) {
      return { success: false, error: 'No audio file generated' };
    }

    return {
      success: true,
      audioPath,
      provider: 'qwen3-tts-local',
      outputFormat: 'ogg',
      voiceCompatible: true,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 以下函数用于配置 UI，返回固定值（因为我们只支持 qwen3-tts-local）
export function getTtsProvider(config, prefsPath) {
  return 'local';
}

export function isTtsEnabled(config, prefsPath) {
  return true; // 默认启用
}

export function isTtsProviderConfigured(config, provider) {
  return provider === 'local';
}

export function resolveTtsAutoMode({ config, prefsPath }) {
  return false;
}

export function resolveTtsApiKey(config, provider) {
  return null; // 不需要 API key
}

export function resolveTtsConfig(cfg) {
  return cfg?.tts ?? {};
}

export function resolveTtsPrefsPath(config) {
  return null;
}

export function setTtsEnabled(prefsPath, enabled) {
  // 无操作，总是启用
}

export function setTtsProvider(prefsPath, provider) {
  // 只支持 local，忽略其他
}

export function resolveTtsProviderOrder(provider) {
  return ['local'];
}