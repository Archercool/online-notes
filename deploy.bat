@echo off
echo ========================
echo Online Notes 部署脚本
echo ========================
echo.

:: 检查 Node.js
echo [1/5] 检查 Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js
    echo 请先安装 Node.js 18+: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已安装

:: 检查 npm
echo [2/5] 检查 npm...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm
    pause
    exit /b 1
)
echo npm 已安装

:: 安装依赖
echo [3/5] 安装依赖...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo 错误: 安装依赖失败
    pause
    exit /b 1
)
echo 依赖安装完成

:: 构建项目
echo [4/5] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 构建失败
    pause
    exit /b 1
)
echo 构建完成

:: 部署到 Cloudflare Pages
echo [5/5] 部署到 Cloudflare Pages...
echo 请输入你的 Cloudflare API Token:
set /p CLOUDFLARE_API_TOKEN=
call npx wrangler pages deploy dist --project-name=online-notes
if %errorlevel% neq 0 (
    echo 错误: 部署失败
    pause
    exit /b 1
)

echo.
echo ========================
echo 部署完成！
echo 访问地址: https://online-notes-dol.pages.dev
echo ========================
pause
