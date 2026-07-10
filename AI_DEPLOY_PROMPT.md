# AI Agent 部署提示词

请帮我部署 Online Notes 项目到 Cloudflare Pages。

## 项目信息
- GitHub 仓库: https://github.com/Archercool/online-notes
- 前端目录: frontend/
- 项目类型: React + Vite + Cloudflare Pages Functions

## 部署要求
1. 克隆项目到本地
2. 安装 Node.js 依赖
3. 构建前端
4. 部署到 Cloudflare Pages

## 执行步骤

### 步骤 1: 克隆项目
```bash
git clone https://github.com/Archercool/online-notes.git
cd online-notes/frontend
```

### 步骤 2: 安装依赖
```bash
npm install
```

### 步骤 3: 构建项目
```bash
npm run build
```

### 步骤 4: 部署到 Cloudflare Pages
需要设置 Cloudflare API Token 环境变量:
```bash
read -p "请输入你的 Cloudflare API Token: " CLOUDFLARE_API_TOKEN
export CLOUDFLARE_API_TOKEN
npx wrangler pages deploy dist --project-name=online-notes
```

### 步骤 5: 配置环境变量
在 Cloudflare Dashboard 中设置 GITHUB_TOKEN 环境变量:
1. 登录 https://dash.cloudflare.com
2. 进入 Workers & Pages → online-notes
3. 点击 设置 → 变量和密钥
4. 添加变量: GITHUB_TOKEN = 你的 GitHub Token

## 验证
部署完成后，访问 https://online-notes-dol.pages.dev 验证:
1. 阅读页面 (/) 可正常访问
2. 管理页面 (/admin) 可正常访问
3. 主题切换功能正常

## 注意事项
- Cloudflare API Token 需要手动输入
- GitHub Token 需要在 Cloudflare Dashboard 中配置为环境变量
- 项目使用双主题系统（深色/浅色）
