# 在线笔记 - 免费的 GitHub 驱动笔记系统

100% 免费，基于 Cloudflare Workers + Cloudflare Pages + GitHub API。

## 架构

```
┌─────────────┐     ┌──────────────────┐     ┌───────────┐
│   前端 (React)│ ──▶ │ Cloudflare Worker │ ──▶ │ GitHub API │
│  Cloudflare  │     │   (API 代理)      │     │  (存储)    │
│    Pages     │     └──────────────────┘     └───────────┘
└─────────────┘            │
                           ▼
                    ┌──────────────┐
                    │ GitHub 仓库   │
                    │ .md 文件存储  │
                    └──────────────┘
```

## 费用

| 服务 | 费用 |
|------|------|
| Cloudflare Pages | 免费（无限带宽） |
| Cloudflare Workers | 免费（10万次/天） |
| GitHub API | 免费（私有仓库 5000 次/小时） |
| **总计** | **$0** |

## 快速开始

### 前置条件
- Node.js 18+
- GitHub 账号
- Cloudflare 账号

### 第一步：创建 GitHub 仓库

1. 在 GitHub 创建一个新仓库（可以是私有的）
2. 仓库名随意，例如 `my-notes`

### 第二步：部署 Worker API

```bash
cd worker

# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login

# 配置仓库（编辑 wrangler.toml 中的 GITHUB_REPO）
# 格式: "用户名/仓库名"

# 设置 GitHub Token（需要 repo 权限）
# 去 https://github.com/settings/tokens 创建 token
npx wrangler secret put GITHUB_TOKEN

# 部署 Worker
npm run deploy
```

部署后会得到一个 URL，例如：
`https://online-notes-api.your-name.workers.dev`

### 第三步：部署前端

```bash
cd frontend

# 安装依赖
npm install

# 配置 API 地址
# 创建 .env 文件
echo "VITE_API_URL=https://online-notes-api.your-name.workers.dev" > .env

# 本地测试
npm run dev

# 构建生产版本
npm run build
```

然后在 Cloudflare Dashboard 部署前端：

1. 登录 https://dash.cloudflare.com
2. 进入 Workers & Pages
3. 点击 Create Application → Pages → Connect to Git
4. 选择你的前端仓库
5. 构建设置：
   - Framework preset: `None`
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`

### 第四步：配置自定义域名（可选）

在 Cloudflare Pages 项目中 → Settings → Custom Domains → 添加你的域名

## 功能

- ✅ Markdown 实时编辑
- ✅ 实时预览（支持 GFM 表格、代码高亮）
- ✅ 文件创建 / 删除 / 重命名
- ✅ 全文搜索
- ✅ 暗色主题
- ✅ 快捷键保存 (Ctrl+S)
- ✅ 工具栏快捷插入 Markdown 语法
- ✅ GitHub 自动备份（每次保存就是一次 commit）
- ✅ 响应式设计（手机可用）

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + S` | 保存当前笔记 |

## 安全说明

- GitHub Token 存储在 Cloudflare Worker 的 Secrets 中
- 前端不暴露任何 Token
- 所有 API 请求通过 Worker 代理

## License

MIT
