/**
 * 声音克隆库 - 睡前魔法书
 * 使用火山引擎TTS声音复刻/克隆API
 */

// 朗读提示文本（用户录制时使用）
export const RECORDING_PROMPTS = [
  "从前有一只小兔子，它的耳朵长长的，每天晚上都会去森林里找妈妈讲故事……",
  "月亮慢慢升起来了，星星在天上眨眼睛。小熊躺在床上，闭上眼睛，开始做一个甜甜的梦……",
  "在一个很远很远的地方，有一座彩虹桥。彩虹桥的尽头，住着一个会讲故事的小精灵……",
];

// 默认提示文本
export const DEFAULT_PROMPT = RECORDING_PROMPTS[0];

// 录制配置
export const RECORDING_CONFIG = {
  maxDuration: 20, // 最大录制20秒（推荐10-20秒）
  minDuration: 5,  // 最小录制5秒
  sampleRate: 16000,
  format: "webm", // 使用webm格式（浏览器原生支持）
};

/**
 * 克隆声音
 * @param audioBlob 音频文件
 * @param userId 用户ID
 * @returns voice_id
 */
export async function cloneVoice(
  audioBlob: Blob,
  userId: string
): Promise<{ voiceId: string; status: "ready" | "processing" }> {
  const apiKey = process.env.VOLCENGINE_TTS_API_KEY;
  const endpoint = process.env.VOLCENGINE_TTS_ENDPOINT || "https://openspeech.bytedance.com/api/v1/mgc/tts";

  if (!apiKey) {
    throw new Error("声音克隆服务未配置");
  }

  // 转换为base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64 || "");
    };
  });
  reader.readAsDataURL(audioBlob);
  const audioBase64 = await base64Promise;

  // 调用火山引擎声音克隆API
  const response = await fetch(`${endpoint}/clone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      audio: audioBase64,
      user_id: userId,
      model: "cosyvoice-v1",
    }),
  });

  if (!response.ok) {
    throw new Error(`声音克隆失败: ${response.status}`);
  }

  const result = await response.json();
  return {
    voiceId: result.voice_id || `voice_${userId}_${Date.now()}`,
    status: result.status || "ready",
  };
}

/**
 * 使用克隆的声音合成音频
 * @param text 要朗读的文本
 * @param voiceId 克隆后的voice_id
 * @returns 音频URL
 */
export async function synthesizeSpeech(
  text: string,
  voiceId: string
): Promise<string> {
  const apiKey = process.env.VOLCENGINE_TTS_API_KEY;
  const endpoint = process.env.VOLCENGINE_TTS_ENDPOINT || "https://openspeech.bytedance.com/api/v1/mgc/tts";

  if (!apiKey) {
    throw new Error("TTS服务未配置");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      appid: process.env.VOLCENGINE_APP_ID,
      voice_id: voiceId,
      text,
      model: "cosyvoice-v1",
      speed: 0.9, // 稍慢，适合睡前
      pitch: 1.0,
      volume: 1.0,
    }),
  });

  if (!response.ok) {
    throw new Error(`语音合成失败: ${response.status}`);
  }

  const result = await response.json();
  return result.audio_url || "";
}

/**
 * 获取录音权限并创建MediaRecorder
 */
export async function getRecorder(): Promise<MediaRecorder | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
      },
    });

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    return recorder;
  } catch (error) {
    console.error("获取录音权限失败:", error);
    return null;
  }
}

/**
 * 停止所有媒体轨道
 */
export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}
