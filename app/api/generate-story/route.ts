import { NextRequest } from "next/server";
import { STYLE_CONFIGS, THEME_CONFIGS, STORY_PROMPT_TEMPLATE } from "@/lib/ai";

// Edge Runtime：无60秒硬限制，流式响应可以长时间运行
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterName, age, theme, style, gender, appearance } = body;

    // 参数验证
    if (!characterName || !age || !theme || !style) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!gender) {
      return new Response(JSON.stringify({ error: "请选择性别" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 12) {
      return new Response(JSON.stringify({ error: "年龄需要在3-12岁之间" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.VOLCENGINE_API_KEY;
    const endpointId = process.env.VOLCENGINE_ENDPOINT_ID || 'ep-20260515174520-v8rzv';
    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
    const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.adventure;
    const genderChinese = gender === "男孩" ? "男孩" : "女孩";
    const appearanceChinese = `${ageNum}岁的${genderChinese}孩子，${appearance || `${gender}，${ageNum}岁`}`;

    const prompt = STORY_PROMPT_TEMPLATE
      .replace("{characterName}", characterName)
      .replace("{age}", String(ageNum))
      .replace("{gender}", gender)
      .replace("{genderChinese}", genderChinese)
      .replace("{appearance}", appearance || `${gender}，${ageNum}岁`)
      .replace("{appearanceChinese}", appearanceChinese)
      .replace("{themeAngle}", themeConfig.storyAngle)
      .replace("{styleChinese}", styleConfig.chinese)
      .replace("{wanchineseStyle}", styleConfig.chinesePrompt);

    // 如果没配API Key，返回mock数据（流式）
    if (!apiKey) {
      const mockData = {
        title: `${characterName}的冒险`,
        appearanceChinese,
        pages: Array.from({ length: 8 }, (_, i) => ({
          pageNumber: i + 1,
          text: `第${i + 1}页的故事内容...`,
          imagePrompt: `${appearanceChinese}, 场景描述, ${styleConfig.chinesePrompt}, 专业儿童绘本插画，手绘质感`
        }))
      };
      return new Response(
        `data: ${JSON.stringify({ type: 'complete', data: mockData })}\n\n`,
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
      );
    }

    // 调用Doubao API（流式读取，但最终返回完整JSON给前端）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const doubaoRes = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpointId,
        messages: [
          { role: "system", content: "你是一位获得过凯迪克金奖的国际顶级绘本大师。请直接输出最终结果，不要进行思考推理过程。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 4000,
        thinking: { type: "disabled" },
        stream: true,
      }),
      signal: controller.signal,
    }).catch(err => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Doubao API请求超时');
      throw new Error(`Doubao API网络错误: ${err.message?.substring(0, 100)}`);
    });

    if (!doubaoRes.ok) {
      clearTimeout(timeoutId);
      const errorText = await doubaoRes.text();
      let errMsg = `Doubao API错误 (${doubaoRes.status})`;
      if (doubaoRes.status === 401) errMsg = 'Doubao API密钥无效';
      else if (doubaoRes.status === 404) errMsg = 'Doubao推理接入点不存在';
      else if (doubaoRes.status === 429) errMsg = 'Doubao API请求过于频繁';
      else errMsg = `Doubao API错误: ${errorText.substring(0, 100)}`;
      return new Response(JSON.stringify({ error: errMsg }), {
        status: doubaoRes.status >= 500 ? 502 : doubaoRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 读取SSE流，拼接完整内容
    const reader = doubaoRes.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) fullContent += delta;
        } catch {}
      }
    }
    clearTimeout(timeoutId);

    // 解析完整JSON
    let jsonStr = fullContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: '故事生成失败：无法解析内容' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    if (!result.appearanceChinese) result.appearanceChinese = appearanceChinese;
    if (result.pages) {
      result.pages = result.pages.map((page: any) => ({
        ...page,
        imagePrompt: page.imagePrompt?.replace(/\{wanchineseStyle\}/g, styleConfig.chinesePrompt) || page.imagePrompt
      }));
    }

    // 返回普通JSON（非SSE）
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "生成故事失败" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
