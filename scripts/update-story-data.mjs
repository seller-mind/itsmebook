/**
 * 更新经典故事数据脚本
 * 添加预生成的 imageUrl 到每个页面
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取URL映射
const urlsData = JSON.parse(readFileSync(join(__dirname, '../src/data/classic-stories-urls.json'), 'utf-8'));

// 读取原始数据
let content = readFileSync(join(__dirname, '../lib/classic-stories.ts'), 'utf-8');

// 更新接口定义
content = content.replace(
  /export interface ClassicStoryPage \{[^}]+\}/,
  `export interface ClassicStoryPage {
  pageNumber: number;
  text: string;           // 30-60字的故事文本，妈妈讲故事风格
  imagePrompt: string;     // AI生图prompt，英文水彩绘本风格
  imageUrl?: string;      // 预生成的绘本级图片URL，Supabase Storage永久存储
}`
);

// 更新每个故事的页面，添加 imageUrl
for (const [storyId, storyData] of Object.entries(urlsData)) {
  const { pages } = storyData;
  
  // 为每个页面添加 imageUrl
  for (let i = 1; i <= 8; i++) {
    const pageKey = `page-${i}`;
    const url = pages[pageKey];
    
    if (url) {
      // 替换现有的页面定义，添加 imageUrl
      // 匹配模式：{ pageNumber: X, text: "...", imagePrompt: `...` }
      const pageRegex = new RegExp(
        `(\\{ pageNumber: ${i}, text: "[^"]*", imagePrompt: \\`[^\\`]+\\` \\})`,
        'g'
      );
      
      const replacement = `{ pageNumber: ${i}, text: "[^"]*", imagePrompt: \`[^\`]+\`, imageUrl: "${url}" }`;
      
      // 更精确的替换：找到包含特定 pageNumber 的行
      const lines = content.split('\n');
      const newLines = [];
      
      let inStory = false;
      for (const line of lines) {
        if (line.includes(`id: "${storyId}"`)) {
          inStory = true;
        }
        
        if (inStory && line.includes(`pageNumber: ${i},`) && line.includes('imagePrompt:')) {
          // 找到这一行，添加 imageUrl
          const newLine = line.trim().replace(/\}$/, `, imageUrl: "${url}" }`);
          newLines.push(newLine);
        } else {
          newLines.push(line);
        }
        
        // 如果遇到下一个故事，停止
        if (inStory && line.includes('id: "') && !line.includes(`"${storyId}"`)) {
          inStory = false;
        }
      }
      
      content = newLines.join('\n');
    }
  }
}

// 写入更新后的文件
writeFileSync(join(__dirname, '../lib/classic-stories.ts'), content, 'utf-8');

console.log('✅ 数据文件更新完成！');
console.log(`📊 更新了 ${Object.keys(urlsData).length} 个故事的URL`);
