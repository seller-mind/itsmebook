#!/usr/bin/env node
/**
 * 批量更新经典故事图片URL - 精确版
 * 按故事ID逐个处理，确保URL对应正确的故事和页面
 */

import { readFileSync, writeFileSync } from 'fs';

// 读取并更新文件
const filePath = '/app/data/所有对话/主对话/AI儿童绘本/itsmebook/lib/classic-stories.ts';
let content = readFileSync(filePath, 'utf-8');

// 故事URL映射
const stories = {
  "ugly-duckling": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ugly-duckling/page-8.png"
  ],
  "thumbelina": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/thumbelina/page-8.png"
  ],
  "flower-of-ida": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/flower-of-ida/page-8.png"
  ],
  "nightingale": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nightingale/page-8.png"
  ],
  "princess-pea": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/princess-pea/page-8.png"
  ],
  "star-silver": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/star-silver/page-8.png"
  ],
  "sleeping-beauty": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/sleeping-beauty/page-8.png"
  ],
  "water-of-life": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/water-of-life/page-8.png"
  ],
  " Bremen-musicians": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/ Bremen-musicians/page-8.png"
  ],
  "chang-e-flight": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/chang-e-flight/page-8.png"
  ],
  "cowherd-weaver": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/cowherd-weaver/page-8.png"
  ],
  "monkey-moon": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/monkey-moon/page-8.png"
  ],
  "pony-crossing": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/pony-crossing/page-8.png"
  ],
  "magic-brush": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/magic-brush/page-8.png"
  ],
  "nine-colored-deer": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/nine-colored-deer/page-8.png"
  ],
  "tortoise-hare": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/tortoise-hare/page-8.png"
  ],
  "lion-mouse": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-3.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-4.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-5.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-6.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-7.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/lion-mouse/page-8.png"
  ],
  "north-wind-sun": [
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/north-wind-sun/page-1.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/north-wind-sun/page-2.png",
    "https://lhxrauqvqvehhqbzvzjr.supabase.co/storage/v1/object/public/classic-stories/north-wind-sun/page-3.png"
  ]
};

let updated = 0;
const lines = content.split('\n');
const newLines = [];
let currentStory = null;

// 逐行处理
for (const line of lines) {
  // 检测故事开始
  const storyMatch = line.match(/id:\s*"(.*?)"/);
  if (storyMatch) {
    currentStory = storyMatch[1];
  }
  
  // 检测页面行
  const pageMatch = line.match(/pageNumber:\s*(\d+)/);
  if (pageMatch && currentStory && stories[currentStory]) {
    const pageNum = parseInt(pageMatch[1]);
    const url = stories[currentStory][pageNum - 1];
    
    if (url && line.includes('imagePrompt:')) {
      // 检查是否已经有imageUrl
      if (!line.includes('imageUrl:')) {
        // 替换行末 - 把 }, 变成 , imageUrl: "...", }
        let newLine = line;
        if (line.match(/}\s*,\s*$/)) {
          // 行末是 }, 格式: 把 }, 替换为 , imageUrl: "..." },
          newLine = line.replace(/(}\s*,\s*)$/, `, imageUrl: "${url}"$1`);
        } else if (line.match(/}\s*$/)) {
          // 行末是 } (无逗号): 添加 , imageUrl: "..."
          newLine = line.replace(/(\s*})\s*$/, `, imageUrl: "${url}"$1`);
        }
        newLines.push(newLine);
        updated++;
        continue;
      }
    }
  }
  
  newLines.push(line);
}

content = newLines.join('\n');

// 更新接口定义 - 在接口定义中添加 imageUrl
content = content.replace(
  /export interface ClassicStoryPage \{([^}]+)\}/,
  `export interface ClassicStoryPage {$1
  imageUrl?: string;      // 预生成的绘本级图片URL，Supabase Storage永久存储
}`
);

writeFileSync(filePath, content, 'utf-8');

console.log('✅ 文件更新完成！');
console.log('📊 更新了 ' + updated + ' 个页面URL');
console.log('📖 完成故事: ' + Object.keys(stories).length + ' 个');
