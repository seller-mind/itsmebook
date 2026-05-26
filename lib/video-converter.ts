/**
 * WebM转MP4工具 - 使用ffmpeg.wasm在浏览器内转换
 * 零服务器依赖，全平台兼容
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let loading = false;
let loaded = false;

export async function convertWebmToMp4(webmBlob: Blob, onProgress?: (msg: string) => void): Promise<Blob> {
  // 初始化ffmpeg
  if (!loaded) {
    if (loading) {
      throw new Error("ffmpeg正在加载中，请稍后重试");
    }
    loading = true;
    onProgress?.("加载视频转换引擎...");
    
    try {
      ffmpeg = new FFmpeg();
      
      // 从CDN加载ffmpeg核心文件
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });
      
      loaded = true;
    } catch (e) {
      ffmpeg = null;
      loading = false;
      throw new Error("视频转换引擎加载失败");
    } finally {
      loading = false;
    }
  }

  if (!ffmpeg) throw new Error("ffmpeg未初始化");

  onProgress?.("转换视频格式中...");

  // 写入输入文件
  const inputData = await fetchFile(webmBlob);
  await ffmpeg.writeFile("input.webm", inputData);

  // 执行转换
  await ffmpeg.exec([
    "-i", "input.webm",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "28",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-y",
    "output.mp4"
  ]);

  // 读取输出文件
  const outputData = await ffmpeg.readFile("output.mp4");
  
  // 清理临时文件
  try { await ffmpeg.deleteFile("input.webm"); } catch {}
  try { await ffmpeg.deleteFile("output.mp4"); } catch {}

  // 返回MP4 Blob
  const mp4Blob = new Blob([new Uint8Array(outputData as Uint8Array)], { type: "video/mp4" });
  return mp4Blob;
}

// 预加载ffmpeg（可选，提前加载减少用户等待）
export async function preloadFFmpeg(): Promise<void> {
  if (loaded || loading) return;
  try {
    await convertWebmToMp4(new Blob(), () => {});
  } catch {
    // 预加载失败不影响正常使用
  }
}
