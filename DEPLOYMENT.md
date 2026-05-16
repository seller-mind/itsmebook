# 「是我呀」AI儿童绘本 - 部署指南

## 功能概述

本次更新实现了**手机号验证码登录**功能，使用阿里云短信认证API。

## 实现方案

### 技术架构

1. **前端**：
   - React (Next.js 14.2.3)
   - @clerk/nextjs ^5.7.0（保留原有邮箱登录）
   - Tailwind CSS

2. **后端**：
   - Next.js API Routes
   - JWT Token (使用 jose 库)
   - Supabase (数据库)

3. **短信服务**：
   - 阿里云短信认证 (dypnsapi)
   - 签名名称：速通互联验证码
   - 模板CODE：100001

### 数据表

需要在 Supabase 创建以下表：

1. **users** - 用户表
2. **sms_codes** - 短信验证码表
3. **books** - 绘本表

**执行 SQL 脚本**：`supabase-schema.sql`

## 部署步骤

### Step 1: 创建 Supabase 数据表

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目
3. 进入 **SQL Editor**
4. 复制 `supabase-schema.sql` 内容并执行

### Step 2: 配置 Vercel 环境变量

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lhxrauqvqvehhqbzvzjr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 从 Supabase 获取 |
| `SUPABASE_SERVICE_ROLE_KEY` | 从 Supabase 获取 |
| `ALIYUN_ACCESS_KEY_ID` | 从阿里云 RAM 控制台获取 |
| `ALIYUN_ACCESS_KEY_SECRET` | 从阿里云 RAM 控制台获取 |
| `JWT_SECRET` | 随机字符串（如 `openssl rand -base64 32` 生成） |

### Step 3: 部署

方式1：通过 GitHub 自动部署
```bash
git add .
git commit -m "feat: 手机号验证码登录（阿里云短信认证）"
git push origin main
```

方式2：Vercel CLI
```bash
cd AI儿童绘本/itsmebook
vercel --prod
```

## API 接口

### 发送验证码
```
POST /api/auth/send-code
Body: { "phone": "13800138000" }
```

### 验证登录
```
POST /api/auth/verify-code
Body: { "phone": "13800138000", "code": "123456" }
```

### 获取当前用户
```
GET /api/auth/me
Headers: { "Authorization": "Bearer <token>" }
```

### 扣减免费次数
```
POST /api/auth/deduct-free-count
Headers: { "Authorization": "Bearer <token>" }
```

## 安全说明

1. **SUPABASE_SERVICE_ROLE_KEY** 只能在服务端使用，禁止暴露给前端
2. **JWT_SECRET** 建议使用更复杂的随机字符串
3. 验证码 5 分钟过期，60 秒内只能发送一次
4. 阿里云 AccessKey 建议使用 RAM 子账号，避免泄露主账号密钥

## 注意事项

1. Vercel Hobby 计划 serverless 函数限制 10 秒
2. 短信发送 API 需在 3 秒内完成
3. 新用户注册赠送 1 次免费生成机会
4. JWT Token 有效期 7 天
