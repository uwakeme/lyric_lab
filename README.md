# LyricLab - 歌词改编工具

一个功能完整的在线歌词改编 Web 应用，支持智能填词、押韵检测、版本管理等功能。

## 功能特性

- **歌曲导入**：支持在线搜索、离线示例库、手动粘贴导入
- **智能填词编辑器**：三栏布局，实时字数统计与押韵检测
- **押韵规则**：支持无押韵、指定韵母、平声尾、仄声尾
- **押韵词库**：内置 6+ 韵母分类，每个 8+ 词语
- **版本管理**：本地版本保存与历史对比
- **导出功能**：支持 TXT、LRC（带时间戳）、LRC（纯歌词）、HTML
- **用户认证**：JWT 双 Token 认证，支持注册/登录
- **歌词爬虫**：定时从歌词网站抓取热门歌曲（预留接口）

## 技术栈

### 前端
- React 18 + TypeScript
- Zustand (状态管理)
- Tailwind CSS
- Vite
- pinyin-pro (拼音处理)
- lucide-react (图标)

### 后端
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt (密码哈希)
- node-cron (定时任务)

## 项目结构

```
lyric-lab/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── editor/       # 填词编辑器
│   │   │   ├── import/       # 歌曲导入
│   │   │   ├── export/       # 导出功能
│   │   │   ├── version/      # 版本管理
│   │   │   ├── preview/      # 歌词预览
│   │   │   ├── auth/         # 认证组件
│   │   │   └── common/       # 通用组件
│   │   ├── services/         # 业务逻辑层
│   │   ├── store/            # Zustand 状态管理
│   │   ├── utils/           # 工具函数
│   │   └── App.tsx          # 应用入口
│   └── package.json
├── server/                   # 后端服务
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── crawler/         # 爬虫模块
│   │   ├── db/              # 数据库
│   │   └── middleware/      # Express 中间件
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

### 1. 克隆项目

```bash
cd lyric-lab
```

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../server
npm install
```

### 3. 配置环境变量

```bash
cd ../server
cp .env.example .env
# 编辑 .env 填入数据库连接信息
```

### 4. 初始化数据库

```bash
cd server
npx prisma migrate dev
npx tsx src/db/seed.ts  # 可选：填充示例数据
```

### 5. 启动应用

```bash
# 终端1：启动后端
npm run dev

# 终端2：启动前端
cd frontend
npm run dev
```

访问 http://localhost:5173

## 环境变量

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/lyric_lab
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CRAWL_INTERVAL=0 2 * * *  # 每天凌晨2点
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## API 接口

### Auth
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| POST | /api/auth/refresh | 刷新 Token |
| GET | /api/auth/me | 获取用户信息 |

### Songs
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/songs | 搜索歌曲 |
| GET | /api/songs/hot | 热门歌曲 |
| GET | /api/songs/:id | 歌曲详情 |

### Versions
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/versions | 版本列表 |
| POST | /api/versions | 创建版本 |
| GET | /api/versions/:id | 版本详情 |
| DELETE | /api/versions/:id | 删除版本 |

## 使用说明

1. **导入歌曲**：左侧面板搜索或粘贴歌词
2. **编辑歌词**：中间区域直接编辑每行文字
3. **设置押韵**：顶部工具栏设置押韵规则
4. **查看押韵**：绿色标记=匹配，红色标记=不匹配
5. **插入押韵词**：右侧面板点击词语快速插入
6. **保存版本**：版本面板保存当前状态
7. **导出歌词**：选择格式导出文件

## License

MIT