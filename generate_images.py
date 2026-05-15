#!/usr/bin/env python3
import json
import subprocess
import time
import concurrent.futures
import os

# 万相API配置
WANXIANG_API_KEY = "sk-dc2a943892cf4f329907824f00d3bbed"
WANXIANG_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"

# 人物描述和风格
BOOK_CONFIGS = {
    "sample-1": {
        "style": "watercolor",
        "character": "A 5-year-old Chinese boy with round face, big eyes, neat short hair, wearing a clean blue short-sleeve T-shirt",
        "characterName": "小宇"
    },
    "sample-2": {
        "style": "fantasy",
        "character": "A 6-year-old Chinese girl with ponytail hair, round big eyes, wearing a pink dress with white floral patterns, cute and adorable",
        "characterName": "朵朵"
    },
    "sample-3": {
        "style": "traditional Chinese painting style, xieyi",
        "character": "A 7-year-old Chinese boy with tiger-like appearance, short crew cut hair, wearing a clean white traditional Chinese jacket (duanlingshan), round and cute face",
        "characterName": "阿宝"
    }
}

def build_image_prompt(book_id, text, page_number):
    """构建图片生成的prompt"""
    config = BOOK_CONFIGS.get(book_id, {})
    style = config.get("style", "children's illustration")
    character = config.get("character", "")
    
    # 根据页面内容构建场景描述
    prompt = f"Children's picture book illustration, {style}, {character}, {text}, warm and dreamy atmosphere, soft lighting, high quality, watercolor style" if "watercolor" in style or style == "watercolor" else f"Children's picture book illustration, {style}, {character}, {text}, warm and magical atmosphere, soft lighting, high quality"
    
    return prompt

def call_wanxiang_api(prompt, output_file):
    """调用万相API生成图片"""
    curl_cmd = [
        "curl", "-s", "-X", "POST", WANXIANG_URL,
        "-H", "Content-Type: application/json",
        "-H", f"Authorization: Bearer {WANXIANG_API_KEY}",
        "-d", json.dumps({
            "model": "wan2.7-image-pro",
            "input": {
                "messages": [{"role": "user", "content": [{"text": prompt}]}]
            },
            "parameters": {"size": "1024*1024", "n": 1}
        })
    ]
    
    try:
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=120)
        response = json.loads(result.stdout)
        
        if "output" in response and "choices" in response["output"]:
            image_url = response["output"]["choices"][0]["content"][0]["image_url"]
            # 下载图片
            download_cmd = ["curl", "-s", "-o", output_file, image_url]
            subprocess.run(download_cmd, timeout=60)
            print(f"✓ Generated: {output_file}")
            return True
        else:
            print(f"✗ Failed: {output_file}, response: {response}")
            return False
    except Exception as e:
        print(f"✗ Error generating {output_file}: {e}")
        return False

def download_existing_image(url, output_file):
    """下载已有的图片"""
    if not url or url.strip() == "":
        return False
    
    try:
        cmd = ["curl", "-s", "-o", output_file, url]
        subprocess.run(cmd, timeout=60)
        if os.path.exists(output_file) and os.path.getsize(output_file) > 1000:
            print(f"✓ Downloaded: {output_file}")
            return True
        else:
            print(f"✗ Failed to download: {output_file}")
            return False
    except Exception as e:
        print(f"✗ Error downloading {output_file}: {e}")
        return False

def main():
    # 读取sample-books.json
    with open("public/sample-books.json", "r", encoding="utf-8") as f:
        books = json.load(f)
    
    # 收集所有需要处理的任务
    tasks = []
    
    for book_idx, book in enumerate(books):
        book_id = book["id"]
        book_index = book_idx + 1
        
        # 处理封面图
        cover_url = book.get("coverImage", "")
        if cover_url:
            cover_file = f"public/sample-images/sample-{book_index}-cover.png"
            tasks.append({
                "type": "download",
                "url": cover_url,
                "file": cover_file,
                "book_id": book_id,
                "page": 0
            })
        
        # 处理每页
        for page in book.get("pages", []):
            page_num = page["pageNumber"]
            image_url = page.get("imageUrl", "")
            text = page.get("text", "")
            page_file = f"public/sample-images/sample-{book_index}-page-{page_num}.png"
            
            if image_url and image_url.strip():
                # 已有URL，下载
                tasks.append({
                    "type": "download",
                    "url": image_url,
                    "file": page_file,
                    "book_id": book_id,
                    "page": page_num
                })
            else:
                # 缺失，需要生成
                prompt = build_image_prompt(book_id, text, page_num)
                tasks.append({
                    "type": "generate",
                    "prompt": prompt,
                    "file": page_file,
                    "book_id": book_id,
                    "page": page_num
                })
    
    print(f"Total tasks: {len(tasks)}")
    print(f"- Downloads: {len([t for t in tasks if t['type'] == 'download'])}")
    print(f"- Generations: {len([t for t in tasks if t['type'] == 'generate'])}")
    
    # 先处理生成任务（并发5个）
    generate_tasks = [t for t in tasks if t["type"] == "generate"]
    download_tasks = [t for t in tasks if t["type"] == "download"]
    
    print("\n=== Generating missing images (5 concurrent) ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for task in generate_tasks:
            future = executor.submit(call_wanxiang_api, task["prompt"], task["file"])
            futures.append((future, task))
            time.sleep(0.5)  # 避免请求过于密集
        
        for future, task in futures:
            try:
                future.result()
            except Exception as e:
                print(f"✗ Failed: {task['file']}, error: {e}")
    
    print("\n=== Downloading existing images ===")
    # 下载现有图片
    for task in download_tasks:
        download_existing_image(task["url"], task["file"])
    
    print("\n=== All downloads complete ===")

if __name__ == "__main__":
    main()
