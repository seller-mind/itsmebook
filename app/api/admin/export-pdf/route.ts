/**
 * 服务端PDF生成API - 是我呀
 * POST /api/admin/export-pdf
 * 
 * 使用jsPDF在服务端生成带中文的PDF绘本
 * 返回PDF文件流直接下载
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, childName, childAge, pages } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ success: false, message: "缺少绘本数据" }, { status: 400 });
    }

    // 动态导入jsPDF
    const { jsPDF } = await import("jspdf");

    // A4横向
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;

    // 封面
    pdf.setFillColor(255, 245, 235);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // 封面图片
    if (pages[0]?.imageUrl) {
      try {
        const imgData = await loadImageAsBase64(pages[0].imageUrl);
        if (imgData) {
          const imgDimensions = getImageDimensions(imgData);
          if (imgDimensions) {
            const imgAspect = imgDimensions.width / imgDimensions.height;
            const drawWidth = pageWidth - margin * 2;
            const drawHeight = drawWidth / imgAspect;
            pdf.addImage(imgData, "JPEG", margin, margin, drawWidth, Math.min(drawHeight, pageHeight * 0.65));
          }
        }
      } catch (e) {
        console.error("封面图片加载失败:", e);
      }
    }

    // 封面标题
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(60, 60, 60);
    pdf.text(title || "My Storybook", pageWidth / 2, pageHeight * 0.75, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${childName || ""} (${childAge || ""}yo)`, pageWidth / 2, pageHeight * 0.82, { align: "center" });

    // AI标注
    pdf.setFontSize(9);
    pdf.setTextColor(180, 180, 180);
    pdf.text("AI Generated Content | AI\u751F\u6210\u5185\u5BB9", pageWidth / 2, pageHeight - margin, { align: "center" });

    // 内容页
    for (let i = 1; i < pages.length - 1; i++) {
      const page = pages[i];
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // 图片（上方70%区域）
      if (page.imageUrl) {
        try {
          const imgData = await loadImageAsBase64(page.imageUrl);
          if (imgData) {
            const dims = getImageDimensions(imgData);
            if (dims) {
              const imgAspect = dims.width / dims.height;
              const maxW = pageWidth - margin * 2;
              const maxH = pageHeight * 0.65;
              let dw, dh;
              if (imgAspect > maxW / maxH) {
                dw = maxW;
                dh = maxW / imgAspect;
              } else {
                dh = maxH;
                dw = maxH * imgAspect;
              }
              const dx = (pageWidth - dw) / 2;
              pdf.addImage(imgData, "JPEG", dx, margin, dw, dh);
            }
          }
        } catch (e) {
          console.error(`第${i}页图片加载失败:`, e);
        }
      }

      // 文字（下方区域）
      const textY = pageHeight * 0.72;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(13);
      pdf.setTextColor(60, 60, 60);

      // 简单换行 - 每行约35个字符
      const text = page.text || "";
      const maxCharsPerLine = 35;
      const lines: string[] = [];
      for (let j = 0; j < text.length; j += maxCharsPerLine) {
        lines.push(text.substring(j, j + maxCharsPerLine));
      }
      lines.forEach((line, li) => {
        pdf.text(line, pageWidth / 2, textY + li * 7, { align: "center" });
      });

      // 页码
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`${i + 1} / ${pages.length - 2}`, pageWidth / 2, pageHeight - margin);
    }

    // 封底
    if (pages.length > 1) {
      pdf.addPage();
      pdf.setFillColor(255, 245, 235);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // 封底图片
      const lastPage = pages[pages.length - 1];
      if (lastPage?.imageUrl) {
        try {
          const imgData = await loadImageAsBase64(lastPage.imageUrl);
          if (imgData) {
            const dims = getImageDimensions(imgData);
            if (dims) {
              const imgAspect = dims.width / dims.height;
              const drawWidth = pageWidth - margin * 2;
              const drawHeight = drawWidth / imgAspect;
              pdf.addImage(imgData, "JPEG", margin, margin, drawWidth, Math.min(drawHeight, pageHeight * 0.55));
            }
          }
        } catch (e) {
          console.error("封底图片加载失败:", e);
        }
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(60, 60, 60);
      pdf.text("The End", pageWidth / 2, pageHeight * 0.7, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(180, 180, 180);
      pdf.text("AI Generated Content | AI\u751F\u6210\u5185\u5BB9", pageWidth / 2, pageHeight * 0.85, { align: "center" });
      pdf.text("itsmebook.com", pageWidth / 2, pageHeight * 0.9, { align: "center" });
    }

    // 输出PDF
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "storybook")}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("PDF生成失败:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 加载图片为Base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    if (!url || url.includes("placehold.co")) return null;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

// 从Base64获取图片尺寸
function getImageDimensions(base64: string): { width: number; height: number } | null {
  try {
    // PNG: width at bytes 16-19, height at 20-23
    if (base64.includes("image/png")) {
      const data = base64.split(",")[1];
      const buf = Buffer.from(data, "base64");
      return {
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
      };
    }
    // JPEG: need to parse SOF marker
    if (base64.includes("image/jpeg") || base64.includes("image/jpg")) {
      const data = base64.split(",")[1];
      const buf = Buffer.from(data, "base64");
      let i = 2;
      while (i < buf.length - 1) {
        if (buf[i] === 0xFF) {
          const marker = buf[i + 1];
          if (marker === 0xC0 || marker === 0xC2) {
            return {
              height: buf.readUInt16BE(i + 5),
              width: buf.readUInt16BE(i + 7),
            };
          }
          i += 2 + buf.readUInt16BE(i + 2);
        } else {
          i++;
        }
      }
    }
    // Default fallback
    return { width: 768, height: 768 };
  } catch {
    return { width: 768, height: 768 };
  }
}
