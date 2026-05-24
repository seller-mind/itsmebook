/**
 * 绘本下载API - 付费用户下载绘本（图片+音频）
 * POST /api/story/download
 * 
 * 接收绘本数据，打包成HTML文件返回（含所有图片和音频链接）
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, childName, pages } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { success: false, message: "缺少绘本数据" },
        { status: 400 }
      );
    }

    // 生成可离线查看的HTML文件
    const html = generateBookHTML(title, childName, pages);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${title}.html`)}`,
      },
    });
  } catch (error: any) {
    console.error("下载失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "下载失败" },
      { status: 500 }
    );
  }
}

function generateBookHTML(title: string, childName: string, pages: any[]): string {
  const pagesHTML = pages.map((page: any, i: number) => `
    <div class="page" onclick="togglePlay(${i})">
      <img src="${page.imageUrl}" alt="第${i + 1}页" loading="lazy" />
      <div class="text-overlay">
        <p class="page-text">${page.text}</p>
        <span class="page-num">${i + 1} / ${pages.length}</span>
      </div>
      ${page.audioUrl ? `<audio id="audio-${i}" src="${page.audioUrl}" preload="auto"></audio>` : ''}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${childName}的专属绘本</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; overflow: hidden; }
    .book { width: 100vw; height: 100vh; position: relative; }
    .page { width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none; cursor: pointer; }
    .page.active { display: flex; flex-direction: column; }
    .page img { width: 100%; height: 65%; object-fit: cover; }
    .text-overlay { 
      height: 35%; 
      background: linear-gradient(to bottom, #2d2d44, #1a1a2e); 
      padding: 24px 20px; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
    }
    .page-text { color: #f0e6d3; font-size: 18px; line-height: 1.8; text-align: center; font-weight: 500; }
    .page-num { color: #8890a4; font-size: 12px; text-align: center; margin-top: 12px; }
    .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; z-index: 10; }
    .controls button { background: rgba(255,255,255,0.15); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; font-size: 20px; cursor: pointer; backdrop-filter: blur(10px); }
    .controls button:hover { background: rgba(255,255,255,0.25); }
    .title-bar { position: fixed; top: 0; left: 0; right: 0; padding: 16px 20px; background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent); z-index: 10; color: white; font-size: 14px; font-weight: 600; }
    .playing-indicator { position: fixed; top: 16px; right: 20px; color: #FF8C42; font-size: 12px; z-index: 10; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .badge { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(255,140,66,0.2); color: #FF8C42; padding: 4px 12px; border-radius: 12px; font-size: 10px; z-index: 10; }
  </style>
</head>
<body>
  <div class="title-bar">📖 ${title} · ${childName}的专属绘本</div>
  <div id="playing-indicator" class="playing-indicator" style="display:none">🔊 正在朗读</div>
  <div class="badge">AI Generated Story · AI生成内容</div>
  <div class="book" id="book">
    ${pagesHTML}
  </div>
  <div class="controls">
    <button onclick="prevPage()">◀</button>
    <button id="playBtn" onclick="toggleCurrentAudio()">🔊</button>
    <button onclick="nextPage()">▶</button>
  </div>
  <script>
    let currentPage = 0;
    const totalPages = ${pages.length};
    let currentAudio = null;
    
    function showPage(n) {
      const pages = document.querySelectorAll('.page');
      stopAudio();
      pages.forEach(p => p.classList.remove('active'));
      currentPage = Math.max(0, Math.min(n, totalPages - 1));
      pages[currentPage].classList.add('active');
      // Auto play if was playing
    }
    
    function nextPage() { if (currentPage < totalPages - 1) showPage(currentPage + 1); }
    function prevPage() { if (currentPage > 0) showPage(currentPage - 1); }
    
    function togglePlay(pageIdx) { /* click page to play */ toggleCurrentAudio(); }
    
    function toggleCurrentAudio() {
      const audio = document.getElementById('audio-' + currentPage);
      const indicator = document.getElementById('playing-indicator');
      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        indicator.style.display = 'none';
        return;
      }
      if (audio) {
        stopAudio();
        currentAudio = audio;
        audio.currentTime = 0;
        audio.play();
        indicator.style.display = 'block';
        audio.onended = () => {
          indicator.style.display = 'none';
          if (currentPage < totalPages - 1) setTimeout(() => { nextPage(); toggleCurrentAudio(); }, 800);
        };
      } else {
        // Web Speech fallback
        const text = document.querySelectorAll('.page')[currentPage]?.querySelector('.page-text')?.textContent;
        if (text && window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'zh-CN'; u.rate = 0.9; u.pitch = 1.1;
          indicator.style.display = 'block';
          u.onend = () => { indicator.style.display = 'none'; if (currentPage < totalPages - 1) setTimeout(() => { nextPage(); toggleCurrentAudio(); }, 800); };
          window.speechSynthesis.speak(u);
        }
      }
    }
    
    function stopAudio() {
      document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; });
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      document.getElementById('playing-indicator').style.display = 'none';
      currentAudio = null;
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextPage();
      else if (e.key === 'ArrowLeft') prevPage();
    });
    
    // Swipe support
    let touchStart = 0;
    document.addEventListener('touchstart', e => touchStart = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(diff) > 50) diff < 0 ? nextPage() : prevPage();
    });
    
    // Init
    showPage(0);
  </script>
</body>
</html>`;
}
