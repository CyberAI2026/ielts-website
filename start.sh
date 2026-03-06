#!/bin/bash

# 雅思学习平台 - 快速启动脚本

echo "🦞 雅思学习平台 - 启动中..."

# 进入项目目录
cd "$(dirname "$0")"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否有本地服务器工具
if command -v npx &> /dev/null; then
    echo "🚀 使用 npx serve 启动本地服务器..."
    echo "📱 访问地址：http://localhost:3000"
    echo ""
    npx serve . -p 3000
elif command -v python3 &> /dev/null; then
    echo "🐍 使用 Python HTTP 服务器启动..."
    echo "📱 访问地址：http://localhost:8000"
    echo ""
    python3 -m http.server 8000
else
    echo "📂 直接在浏览器中打开 index.html"
    echo ""
    open index.html
fi
