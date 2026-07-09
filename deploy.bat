@echo off
setlocal enabledelayedexpansion

echo ======================================
echo   在线笔记 - 一键部署脚本
echo ======================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 请先安装 Node.js: https://nodejs.org
    exit /b 1
)

:: 检查 Wrangler
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 请先安装 npx
    exit /b 1
)

:: 部署 Worker
echo [1/3] 部署 Cloudflare Worker...
echo.
cd worker
call npm install
if %errorlevel% neq 0 (
    echo [错误] Worker 依赖安装失败
    exit /b 1
)

echo.
echo 请确保已运行: npx wrangler secret put GITHUB_TOKEN
echo 请确保 wrangler.toml 中的 GITHUB_REPO 已正确配置
echo.
set /p CONFIRM="是否继续部署 Worker? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo 已取消
    exit /b 0
)

call npx wrangler deploy
if %errorlevel% neq 0 (
    echo [错误] Worker 部署失败
    exit /b 1
)
cd ..

echo.
echo [2/3] 构建前端...
echo.
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    exit /b 1
)

:: 询问 Worker URL
echo.
set /p WORKER_URL="请输入 Worker URL (例如 https://xxx.workers.dev): "
echo VITE_API_URL=%WORKER_URL%> .env

call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败
    exit /b 1
)
cd ..

echo.
echo [3/3] 完成！
echo.
echo ======================================
echo   下一步操作：
echo ======================================
echo.
echo   1. 将整个项目推送到 GitHub 仓库
echo   2. 在 Cloudflare Dashboard 创建 Pages 项目
echo      - 构建命令: cd frontend ^&^& npm install ^&^& npm run build
echo      - 输出目录: frontend/dist
echo   3. 或者使用 Direct Upload：
echo      - 在 Cloudflare Pages 项目中选择 Direct Upload
echo      - 上传 frontend/dist 目录
echo.
echo   Worker URL: %WORKER_URL%
echo.
pause
