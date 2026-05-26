/**
 * 阿里云函数计算 - WebM转MP4
 * HTTP触发器，接收WebM文件，用ffmpeg转MP4返回
 */

const { execFile } = require('child_process');
const { tmpdir } = require('os');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const path = require('path');

// ffmpeg路径（函数计算层提供）
const FFMPEG = process.env.FFMPEG_PATH || '/opt/bin/ffmpeg';

exports.handler = async (req, resp, context) => {
  // CORS
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    resp.setStatusCode(204);
    resp.send('');
    return;
  }
  
  if (req.method !== 'POST') {
    resp.setStatusCode(405);
    resp.send(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const tmpId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(tmpdir(), `input_${tmpId}.webm`);
  const outputPath = path.join(tmpdir(), `output_${tmpId}.mp4`);

  try {
    // 获取请求体
    let body;
    if (req.body instanceof Buffer) {
      body = req.body;
    } else {
      // 从流中读取
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    if (!body || body.length === 0) {
      resp.setStatusCode(400);
      resp.send(JSON.stringify({ error: 'No data received' }));
      return;
    }

    console.log(`Received WebM file: ${body.length} bytes`);

    // 写入临时文件
    writeFileSync(inputPath, body);

    // ffmpeg转MP4
    await new Promise((resolve, reject) => {
      execFile(FFMPEG, [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        outputPath
      ], { timeout: 60000, maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error('ffmpeg error:', stderr || error.message);
          reject(error);
        } else {
          console.log('ffmpeg success:', stdout?.slice(0, 200));
          resolve();
        }
      });
    });

    // 读取输出文件
    const mp4Data = readFileSync(outputPath);
    console.log(`MP4 generated: ${mp4Data.length} bytes`);

    // 返回MP4
    resp.setStatusCode(200);
    resp.setHeader('Content-Type', 'video/mp4');
    resp.setHeader('Content-Length', mp4Data.length.toString());
    resp.send(mp4Data);

  } catch (error) {
    console.error('Conversion failed:', error);
    resp.setStatusCode(500);
    resp.send(JSON.stringify({ error: error.message || 'Conversion failed' }));
  } finally {
    // 清理临时文件
    try { unlinkSync(inputPath); } catch {}
    try { unlinkSync(outputPath); } catch {}
  }
};
