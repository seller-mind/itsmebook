# 是我呀 - AI儿童绘本生成器

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38b2ac?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/AI-OpenAI-gpt?style=flat-square" alt="AI">
</p>

<p align="center">
  <strong>你的孩子就是绘本的主角</strong>
</p>

<p align="center">
  <a href="https://itsmebook.com">🌐 官网</a>
  •
  <a href="#快速开始">🚀 快速开始</a>
  •
  <a href="#功能特点">✨ 功能特点</a>
  •
  <a href="#部署">📦 部署</a>
</p>

---

## 📖 项目简介

"是我呀"是一款AI儿童绘本生成器，帮助家长为孩子创作独一无二的专属绘本。用户只需上传孩子的照片，选择喜欢的风格和主题，AI即可自动生成8-12页的精美绘本故事。

### 核心功能

- 📷 **照片上传** - 上传1-3张孩子照片
- 🎨 **风格选择** - 8种精美绘本风格可选
- 📚 **主题选择** - 多种故事主题
- ✨ **AI生成** - 自动生成故事文本和插图
- 📖 **翻页预览** - 沉浸式绘本浏览体验
- 📥 **PDF下载** - 导出高清绘本

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Next.js 14 | React框架（App Router） |
| TypeScript | 类型安全 |
| Tailwind CSS | 样式框架 |
| Clerk | 用户认证 |
| OpenAI | GPT-4o-mini + DALL-E 3 |
| Supabase | 数据库 |

## ⚡ 快速开始

### 前置要求

- Node.js 18+
- npm / yarn / pnpm
- OpenAI API Key（可选，MVP阶段可使用mock数据）
- Clerk 账户（用于认证）

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/itsmebook.git
cd itsmebook

# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local

# 编辑 .env.local 填入你的API Keys
```

### 配置环境变量

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# OpenAI API
OPENAI_API_KEY=sk-xxxxx

# Supabase (可选)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

> 💡 **注意**: 如果没有配置API Key，系统会使用mock数据运行，页面可正常预览。

## 📁 项目结构

```
itsmebook/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── generate-story/  # 故事生成API
│   │   ├── generate-image/  # 图像生成API
│   │   └── upload/          # 照片上传API
│   ├── book/[id]/         # 绘本预览页
│   ├── create/            # 制作流程页
│   ├── pricing/           # 定价页
│   ├── privacy/           # 隐私政策
│   ├── terms/             # 用户协议
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── Navbar.tsx         # 导航栏
│   ├── HeroSection.tsx    # Hero区域
│   ├── StyleShowcase.tsx  # 风格展示
│   ├── ProcessSteps.tsx   # 流程步骤
│   ├── BookViewer.tsx     # 绘本翻页器
│   ├── ChildConsentModal.tsx  # 儿童隐私弹窗
│   └── AIBadge.tsx        # AI标识组件
├── lib/                   # 工具库
│   ├── openai.ts          # OpenAI客户端
│   ├── supabase.ts        # Supabase客户端
│   └── replicate.ts       # Replicate客户端（后续）
├── public/                # 静态资源
└── package.json
```

## 🎨 设计规范

### 配色方案

| 颜色 | 色值 | 用途 |
|------|------|------|
| Primary Orange | #FF8C42 | 主色调、CTA按钮 |
| Secondary Blue | #4A90D9 | 辅助色、链接 |
| Primary Light | #FFF5EB | 浅色背景 |
| Primary Dark | #E67A35 | 悬停状态 |

### 字体

- 主字体：`Noto Sans SC` (正文)
- 展示字体：`Noto Serif SC` (标题)

## 📦 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/itsmebook)

1. 点击上方按钮克隆项目
2. 在 Vercel 中配置环境变量
3. 自动部署完成

### 手动部署

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

## 🔧 后续开发

### 角色一致性（IP-Adapter）

计划使用 [Replicate IP-Adapter](https://replicate.com/yorickvp/ip-adapter) 实现角色一致性，让AI生成的角色与孩子本人更加相似。

### 支付集成

计划集成支付宝支付，支持国内用户便捷付款。

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Clerk](https://clerk.com/)
- [OpenAI](https://openai.com/)

---

<p align="center">
  用AI为孩子创作独一无二的故事 📚
</p>
