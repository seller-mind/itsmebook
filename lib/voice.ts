/**
 * 声音库 - 是我呀 V2
 * 使用AI标准声音朗读，默认使用"龙呼呼"儿童故事声线
 */

// 默认使用龙呼呼声线（天真女童声线，最适合儿童故事）
const DEFAULT_VOICE = "longhuhu_v3";

/**
 * 使用AI标准声音合成音频
 * @param text 要朗读的文本
 * @param voice 声音ID（可选，默认使用龙呼呼声线）
 * @returns 音频URL
 */
export async function synthesizeSpeech(
  text: string,
  voice: string = DEFAULT_VOICE
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
      voice_id: voice,
      text,
      model: "cosyvoice-v1",
      speed: 0.9, // 稍慢，适合故事
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
