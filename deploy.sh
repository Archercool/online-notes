#!/bin/bash

echo "========================"
echo "Online Notes 部署脚本"
echo "========================"
echo ""

# 检查 Node.js
echo "[1/5] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo "请先安装 Node.js 18+: https://nodejs.org/"
    exit 1
fi
echo "Node.js 已安装: $(node -v)"

# 检查 npm
echo "[2/5] 检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm"
    exit 1
fi
echo "npm 已安装: $(npm -v)"

# 安装依赖
echo "[3/5] 安装依赖..."
cd frontend
if ! npm install; then
    echo "错误: 安装依赖失败"
    exit 1
fi
echo "依赖安装完成"

# 构建项目
echo "[4/5] 构建项目..."
if ! npm run build; then
    echo "错误: 构建失败"
    exit 1
fi
echo "构建完成"

# 部署到 Cloudflare Pages
echo "[5/5] 部署到 Cloudflare Pages..."
read -p "请输入你的 Cloudflare API Token: " CLOUDFLARE_API_TOKEN
export CLOUDFLARE_API_TOKEN
if ! npx wrangler pages deploy dist --project-name=online-notes; then
    echo "错误: 部署失败"
    exit 1
fi

echo ""
echo "========================"
echo "部署完成！"
echo "访问地址: https://online-notes-dol.pages.dev"
echo "========================"
