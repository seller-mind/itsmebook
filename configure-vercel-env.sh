#!/bin/bash
# ============================================
# Vercel 环境变量配置脚本
# ============================================
# 使用方法: ./configure-vercel-env.sh
# 
# ⚠️ 重要：首次使用前请填写下方配置值
# ============================================

set -e

# ============================================
# 请填写以下配置
# ============================================
VERCEL_API_TOKEN=""           # 替换为你的 Vercel API Token
PROJECT_ID=""                  # 替换为你的 Project ID
TEAM_ID=""                     # 替换为你的 Team ID (可选)

# 环境变量值（请替换为实际值）
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
ALIYUN_ACCESS_KEY_ID=""
ALIYUN_ACCESS_KEY_SECRET=""
JWT_SECRET=""

# ============================================
# 验证配置
# ============================================
if [ -z "$VERCEL_API_TOKEN" ] || [ "$VERCEL_API_TOKEN" = "" ]; then
  echo "错误：请先在脚本中填写 VERCEL_API_TOKEN"
  exit 1
fi

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "" ]; then
  echo "错误：请先在脚本中填写 PROJECT_ID"
  exit 1
fi

# ============================================
# 配置环境变量
# ============================================
declare -A ENV_VARS
ENV_VARS=(
  ["NEXT_PUBLIC_SUPABASE_URL"]="${NEXT_PUBLIC_SUPABASE_URL}"
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
  ["SUPABASE_SERVICE_ROLE_KEY"]="${SUPABASE_SERVICE_ROLE_KEY}"
  ["ALIYUN_ACCESS_KEY_ID"]="${ALIYUN_ACCESS_KEY_ID}"
  ["ALIYUN_ACCESS_KEY_SECRET"]="${ALIYUN_ACCESS_KEY_SECRET}"
  ["JWT_SECRET"]="${JWT_SECRET}"
)

echo "============================================"
echo "配置 Vercel 环境变量"
echo "============================================"

# 配置每个环境变量
for KEY in "${!ENV_VARS[@]}"; do
  VALUE="${ENV_VARS[$KEY]}"
  
  # 跳过空值
  if [ -z "$VALUE" ] || [ "$VALUE" = "" ]; then
    echo "跳过 $KEY (未配置)"
    continue
  fi
  
  echo "配置 $KEY..."
  
  # 构建请求URL
  URL="https://api.vercel.com/v10/projects/${PROJECT_ID}/env"
  if [ -n "$TEAM_ID" ]; then
    URL="${URL}?teamId=${TEAM_ID}"
  fi
  
  RESPONSE=$(curl -s -X POST "$URL" \
    -H "Authorization: Bearer ${VERCEL_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"${KEY}\",
      \"value\": \"${VALUE}\",
      \"target\": [\"production\", \"preview\", \"development\"],
      \"type\": \"plain\"
    }")
  
  if echo "$RESPONSE" | grep -q "id"; then
    echo "  ✓ $KEY 配置成功"
  else
    echo "  ! $KEY 配置结果: $RESPONSE"
  fi
done

echo ""
echo "============================================"
echo "环境变量配置完成！"
echo "============================================"
echo ""
echo "请手动在 Vercel Dashboard 中验证环境变量是否正确配置："
echo "1. 访问: https://vercel.com/dashboard"
echo "2. 选择你的项目"
echo "3. 进入 Settings -> Environment Variables"
echo ""
echo "重要：生产环境请确保以下敏感值已正确配置："
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- ALIYUN_ACCESS_KEY_SECRET"
echo "- JWT_SECRET"
echo "============================================"
