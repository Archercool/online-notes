# Online Notes 项目部署指南

## 项目概述
这是一个基于 GitHub 仓库的免费在线笔记系统，使用 Cloudflare Pages 作为前端托管。

## 技术栈
- **前端**: React 18 + Vite + react-router-dom
- **后端**: Cloudflare Pages Functions (API)
- **存储**: GitHub API
- **部署**: Cloudflare Pages

## 项目结构
```
online-notes/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── App.jsx        # 路由入口
│   │   ├── ReadPage.jsx   # 阅读页面 (/)
│   │   ├── AdminPage.jsx  # 管理页面 (/admin)
│   │   ├── index.css      # 全局样式 + 主题变量
│   │   ├── ReadPage.css   # 阅读页样式
│   │   └── AdminPage.css  # 管理页样式
│   ├── functions/         # Cloudflare Pages Functions (API)
│   │   └── api/
│   │       ├── files.js   # 获取文件列表
│   │       ├── file.js    # 读取文件内容
│   │       ├── create.js  # 创建文件
│   │       ├── save.js    # 保存文件
│   │       └── delete.js  # 删除文件
│   ├── dist/              # 构建输出
│   └── package.json
└── README.md
```

## 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare API Token (用于部署)
- GitHub Token (用于 API 访问)

## 部署步骤

### 1. 克隆项目
```bash
git clone https://github.com/Archercool/online-notes.git
cd online-notes/frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发
```bash
npm run dev
# 访问 http://localhost:5173
```

### 4. 构建生产版本
```bash
npm run build
```

### 5. 部署到 Cloudflare Pages
```bash
# 设置 Cloudflare API Token
read -p "请输入你的 Cloudflare API Token: " CLOUDFLARE_API_TOKEN
export CLOUDFLARE_API_TOKEN

# 部署
npx wrangler pages deploy dist --project-name=online-notes
```

### 6. 配置环境变量
在 Cloudflare Dashboard 中设置 GITHUB_TOKEN 环境变量:
1. 登录 https://dash.cloudflare.com
2. 进入 Workers & Pages → online-notes
3. 点击 设置 → 变量和密钥
4. 添加变量: GITHUB_TOKEN = 你的 GitHub Token

### 7. 验证部署
访问 https://online-notes-dol.pages.dev

## 功能说明

### 阅读页面 (/)
- 公开访问的笔记列表
- 点击笔记可阅读内容
- 支持深色/浅色主题切换

### 管理页面 (/admin)
- 笔记创建、编辑、删除
- Markdown 实时预览
- 搜索功能
- Ctrl+S 快捷保存

### API 端点
- `GET /api/files` - 获取笔记列表
- `GET /api/file?path=xxx` - 读取笔记内容
- `POST /api/create` - 创建笔记
- `POST /api/save` - 保存笔记
- `POST /api/delete` - 删除笔记

## 配置说明

### GitHub Token
- 位置: Cloudflare Dashboard 环境变量
- 用途: 访问 GitHub API 进行文件操作
- 配置: 在 Cloudflare Pages 项目设置中添加 GITHUB_TOKEN 环境变量

### Cloudflare API Token
- 用途: 部署到 Cloudflare Pages
- 获取: https://dash.cloudflare.com/profile/api-tokens
- 权限: Cloudflare Pages 部署权限

## 常见问题

### Q: 部署后页面空白
A: 检查 Cloudflare Pages 的构建设置，确保构建命令为 `npm run build`，输出目录为 `dist`

### Q: API 请求失败
A: 确认 Cloudflare Pages Functions 已正确部署，检查 GITHUB_TOKEN 环境变量是否配置

### Q: 主题切换不生效
A: 检查 localStorage 是否被禁用，主题偏好存储在 localStorage 中

## 开发说明

### 样式系统
- 使用 CSS 变量定义主题
- 支持深色/浅色双主题
- 像素代码风格设计

### 组件结构
- `App.jsx` - 路由配置
- `ReadPage.jsx` - 阅读页面组件
- `AdminPage.jsx` - 管理页面组件

### 状态管理
- 使用 React useState 管理组件状态
- 使用 useEffect 处理副作用
- 使用 useCallback 优化性能

## 部署验证清单
- [ ] Node.js 18+ 已安装
- [ ] 项目已克隆
- [ ] 依赖已安装
- [ ] 本地开发可访问
- [ ] 构建成功
- [ ] 部署成功
- [ ] GITHUB_TOKEN 环境变量已配置
- [ ] 阅读页面可访问
- [ ] 管理页面可访问
- [ ] API 功能正常
- [ ] 主题切换正常
