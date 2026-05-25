/**
 * PDF导出组件 - 是我呀 Admin
 * 生成高清PDF绘本
 * 
 * 功能：
 * - 封面 + 内页 + 封底
 * - 高清配图
 * - AI生成内容标注
 */

"use client";

import { useState } from "react";

interface PDFExportProps {
  bookId: string;
  title: string;
  characterName: string;
  characterAge: number;
  pages: Array<{
    pageNumber: number;
    imageUrl: string;
    text: string;
  }>;
  onComplete?: (blob: Blob) => void;
}

export default function PDFExport({
  bookId,
  title,
  characterName,
  characterAge,
  pages,
  onComplete,
}: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // 生成PDF
  const exportPDF = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setProgress(0);
    setStatus("准备中...");
    setPdfUrl(null);

    try {
      // 动态导入jspdf
      setStatus("加载PDF库...");
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

      // 加载封面图片
      setStatus("加载封面...");
      const coverImg = await loadImage(pages[0]?.imageUrl);
      setProgress(10);

      // 绘制封面
      setStatus("生成封面...");
      pdf.setFillColor(255, 245, 235);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // 封面图片（上方大部分区域）
      if (coverImg) {
        const imgAspect = coverImg.width / coverImg.height;
        const drawWidth = pageWidth - margin * 2;
        const drawHeight = drawWidth / imgAspect;
        const drawY = margin;
        pdf.addImage(coverImg.data, "JPEG", margin, drawY, drawWidth, Math.min(drawHeight, pageHeight * 0.7));
      }

      // 封面标题
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.setTextColor(60, 60, 60);
      pdf.text(title || "我的绘本", pageWidth / 2, pageHeight * 0.78, { align: "center" });

      // 主角信息
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`主角：${characterName}（${characterAge}岁）`, pageWidth / 2, pageHeight * 0.84, { align: "center" });

      // AI标注
      pdf.setFontSize(10);
      pdf.setTextColor(180, 180, 180);
      pdf.text("✨ AI生成内容", pageWidth / 2, pageHeight - margin, { align: "center" });

      // 品牌
      pdf.text("— 是我呀 —", pageWidth / 2, pageHeight - margin - 6, { align: "center" });

      setProgress(20);

      // 生成内容页
      const contentPages = pages.slice(1, -1); // 去掉封面和封底
      const totalPages = contentPages.length;

      for (let i = 0; i < contentPages.length; i++) {
        if (isExporting === false) break; // 检查是否取消

        const page = contentPages[i];
        setStatus(`生成第 ${i + 2} 页...`);
        
        pdf.addPage();

        // 背景
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        // 加载图片
        const img = await loadImage(page.imageUrl);
        setProgress(20 + Math.floor((i / totalPages) * 70));

        // 绘制图片（左侧，占页面60%）
        if (img) {
          const imgAspect = img.width / img.height;
          const imgAreaHeight = pageHeight - margin * 2;
          const imgAreaWidth = (pageWidth - margin * 3) * 0.6;
          
          let drawWidth, drawHeight;
          if (imgAspect > imgAreaWidth / imgAreaHeight) {
            drawWidth = imgAreaWidth;
            drawHeight = imgAreaWidth / imgAspect;
          } else {
            drawHeight = imgAreaHeight;
            drawWidth = imgAreaHeight * imgAspect;
          }
          
          const drawX = margin;
          const drawY = margin + (imgAreaHeight - drawHeight) / 2;
          pdf.addImage(img.data, "JPEG", drawX, drawY, drawWidth, drawHeight);
        }

        // 绘制文字（右侧）
        const textX = margin * 2 + (pageWidth - margin * 3) * 0.6;
        const textWidth = pageWidth - textX - margin;

        // 页码
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(200, 200, 200);
        pdf.text(`${i + 2}`, pageWidth - margin, margin, { align: "right" });

        // 故事文字
        pdf.setFontSize(16);
        pdf.setTextColor(60, 60, 60);

        // 自动换行
        const lines = pdf.splitTextToSize(page.text, textWidth - 10);
        const lineHeight = 8;
        const startY = margin + 20;

        lines.forEach((line: string, index: number) => {
          pdf.text(line, textX, startY + index * lineHeight);
        });
      }

      // 生成封底
      setStatus("生成封底...");
      pdf.addPage();
      
      pdf.setFillColor(255, 245, 235);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // 封底文字
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(60, 60, 60);
      pdf.text("故事结束", pageWidth / 2, pageHeight * 0.35, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${characterName}的冒险还在继续...`, pageWidth / 2, pageHeight * 0.45, { align: "center" });

      // 主角信息
      pdf.setFontSize(12);
      pdf.text(`主角：${characterName}（${characterAge}岁）`, pageWidth / 2, pageHeight * 0.55, { align: "center" });

      // 品牌和AI标注
      pdf.setFontSize(10);
      pdf.setTextColor(180, 180, 180);
      pdf.text("✨ AI生成内容", pageWidth / 2, pageHeight * 0.75, { align: "center" });
      pdf.text("— 是我呀 —", pageWidth / 2, pageHeight * 0.82, { align: "center" });

      // 制作信息
      pdf.setFontSize(8);
      pdf.setTextColor(200, 200, 200);
      pdf.text("由是我呀AI绘本生成器制作", pageWidth / 2, pageHeight - margin, { align: "center" });

      setProgress(95);

      // 生成PDF Blob
      setStatus("生成PDF文件...");
      const pdfBlob = pdf.output("blob");
      
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setStatus("导出完成！");
      setProgress(100);

      if (onComplete) {
        onComplete(pdfBlob);
      }

    } catch (error: any) {
      console.error("PDF导出失败:", error);
      setStatus(`导出失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 加载图片
  const loadImage = (url: string): Promise<{ data: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            resolve({ data: dataUrl, width: img.width, height: img.height });
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error("图片加载失败:", e);
          resolve(null);
        }
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = url;
    });
  };

  // 下载PDF
  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${title || "绘本"}.pdf`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📄</span> PDF导出
      </h3>

      {/* 导出进度 */}
      {isExporting && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* PDF预览提示 */}
      {pdfUrl && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 flex items-center gap-2">
            <span>✅</span> PDF已生成
          </p>
          <p className="text-sm text-green-600 mt-1">
            共 {pages.length + 2} 页（含封面和封底）
          </p>
          <button
            onClick={downloadPDF}
            className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>⬇️</span> 下载PDF
          </button>
        </div>
      )}

      {/* 导出按钮 */}
      {!isExporting && !pdfUrl && (
        <button
          onClick={exportPDF}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>📄</span>
          导出PDF（{pages.length + 2}页，含封面封底）
        </button>
      )}

      {/* 提示 */}
      <p className="mt-3 text-xs text-gray-400 text-center">
        PDF格式：A4横向，高清图片
        <br />
        包含AI生成内容标注
      </p>
    </div>
  );
}
