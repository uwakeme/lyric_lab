你是一名资深全栈工程师兼UI设计师，需要从零创建一个功能完整的"歌词改编"Web应用。项目要求模块化、可维护，前端为主，必要时可引入后端服务。

## 技术栈建议（可自行调整）

**前端：** React 18+ / Vue 3+ 或原生 ES Modules，搭配 Vite / Webpack 构建。UI 可采用 Tailwind CSS 或 CSS Modules。
**后端：** Node.js (Express) + TypeScript，提供 RESTful API。数据库使用 PostgreSQL，通过 Prisma 或 Knex 作为 ORM。
**认证：** JWT（access token + refresh token），密码 bcrypt 加盐哈希，支持邮箱注册/登录。
**定时任务：** node-cron 驱动歌词爬虫，定时从歌词网站抓取热门歌曲并入库。
**依赖管理：** 前端库优先通过 npm 安装；pinyin-pro 作为核心依赖安装，图标库推荐 lucide-react 或 Font Awesome。

## 项目结构参考

```
lyric-lab/
├── frontend/
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   │   ├── editor/        # 填词编辑器相关
│   │   │   ├── import/        # 歌曲导入相关
│   │   │   ├── export/        # 导出功能相关
│   │   │   ├── version/       # 版本管理相关
│   │   │   ├── preview/       # 歌词排版预览
│   │   │   ├── auth/          # 登录/注册相关组件
│   │   │   └── common/        # 通用UI组件（Toast、Modal等）
│   │   ├── hooks/             # 自定义 Hooks / Composables
│   │   ├── services/          # 业务逻辑层
│   │   │   ├── lyricService.js    # 歌词解析、押韵检测
│   │   │   ├── rhymeService.js    # 押韵词库、韵母匹配
│   │   │   ├── exportService.js   # 导出逻辑（TXT/LRC/HTML）
│   │   │   ├── versionService.js  # 版本管理、localStorage持久化
│   │   │   ├── songService.js     # 歌曲搜索（调用后端API）
│   │   │   └── authService.js     # 登录/注册、token管理
│   │   ├── store/             # 状态管理（Pinia / Zustand / Context）
│   │   │   ├── editorStore.js     # 编辑器状态
│   │   │   └── authStore.js       # 用户认证状态
│   │   ├── utils/             # 工具函数（字数统计、拼音处理等）
│   │   ├── assets/            # 静态资源、样式
│   │   └── App.tsx            # 入口（含路由守卫）
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts            # 注册/登录/刷新token
│   │   │   ├── songs.ts           # 歌曲查询/搜索
│   │   │   └── versions.ts        # 云端版本同步（登录用户）
│   │   ├── services/
│   │   │   ├── authService.ts     # 密码哈希、JWT签发/验证
│   │   │   ├── songService.ts     # 歌曲/歌词查询
│   │   │   └── crawlerService.ts  # 爬虫核心逻辑
│   │   ├── crawler/
│   │   │   ├── index.ts           # 爬虫调度入口（node-cron）
│   │   │   ├── sources/           # 各歌词网站的爬虫适配器
│   │   │   │   ├── qqMusic.ts
│   │   │   │   └── neteaseMusic.ts
│   │   │   └── parser.ts          # 歌词文本解析/清洗
│   │   ├── db/
│   │   │   ├── schema.prisma      # Prisma schema（或 knex migrations）
│   │   │   └── seed.ts            # 初始数据填充
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT 验证中间件
│   │   │   └── errorHandler.ts    # 全局错误处理
│   │   └── app.ts                 # Express 应用入口
│   ├── .env.example               # DATABASE_URL, JWT_SECRET 等
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

模块职责明确，各层之间通过接口/类型定义约束，避免循环依赖。前端与后端通过 RESTful API 通信，所有请求统一在 `services/` 层发起，组件不直接调用 fetch/axios。

未登录用户仍可使用编辑器全部核心功能（数据存 localStorage）；登录后解锁云端版本同步、在线歌曲搜索等增强功能。

---

## 一、核心功能模块

### 1. 歌曲/歌词导入系统
- **在线搜索（登录用户）**：搜索框输入关键词，调用 `GET /api/songs?keyword=xxx` 从 PostgreSQL 数据库模糊匹配歌曲。数据库歌曲由爬虫定期更新，保持热度。
- **离线示例库（未登录/降级）**：前端 `songService.js` 内置 10 首中文歌曲示例数据，后端不可用时自动切换为本地过滤，确保任何时候都能使用。数据格式：`{id, title, artist, lyrics: [{section, lines}]}`。
- **手动导入**：提供文本输入区，用户可粘贴任意歌词文本，点击"导入"后自动按行/段落解析为句子列表。
- **加载状态**：在线搜索显示骨架屏或加载指示器；请求失败时降级到本地数据并 Toast 提示。导入成功后有轻提示。

### 2. 智能填词编辑器
- **布局**：桌面端三栏（左：导入/版本 | 中：编辑器 | 右：参考/词库），移动端单栏+底部Tab切换。右侧参考面板可折叠。
- **段落编辑**：以"段落"为单位，每个段落有可编辑标题（如"主歌A""副歌"），段内每行一句，支持增删句子、调整段落顺序（上移/下移/添加/删除）。
- **原歌词参考**：右侧面板同步显示原歌词对应句子，高亮当前编辑行。
- **字数限制**：工具栏可为当前段落或全局设定每句字数范围（如 7-9 字）。每行实时显示字数，超出范围时给出红色边框或警告图标。
  - 字数统计规则：中文、数字、英文字母各算一字，标点不计。写在独立工具函数中。
- **押韵规则与检测**：
  - 工具栏押韵设置：无押韵 / 指定韵母（如 "ang" "i" "u"） / 平声尾 / 仄声尾。
  - 利用 pinyin-pro 获取每行末字的拼音（声母、韵母、声调），实时检测是否匹配规则。
  - 一声、二声为平，三声、四声为仄，轻声归入平声。
  - 匹配的行末字显示绿色标记，不匹配的显示红色标记及具体差异（韵母不符/声调不符）。
  - 押韵检测逻辑封装在 `rhymeService.js`，与 UI 解耦。
- **押韵词库参考面板**：按韵母分类内置常用押韵词库（≥6 个韵母，每个 ≥8 个词语）。数据存放于独立 JSON 或 JS 模块。点击词语可快速插入光标位置或替换行末词。
- **节拍提示**（可选）：手动为每句设置数字（大致节拍/音节数），显示在行尾浅色文字。
- **押韵整体检查**：工具栏"检查全文"按钮，扫描所有已开启押韵规则的句子，统计成功率并高亮失败行。

### 3. 导出功能
- 所有导出逻辑封装在 `exportService.js` 中，UI 仅负责触发和参数选择。
- **导出 TXT**：纯文本，段落间空行，每行一句。
- **导出 LRC**：① 简单递增时间戳（起始 00:00.00，每句间隔 5 秒）；② 不含时间戳的纯歌词 LRC。
- **导出 HTML**：独立 HTML 页面，包含段落标题和歌词内容，排版美观，可直接浏览器查看或打印。
- 导出通过浏览器 `Blob` + `URL.createObjectURL` 触发下载，文件名格式：`{歌曲名}_{改编时间}`。

### 4. 版本历史与对比
- **保存版本**：点击"保存版本"，当前完整歌词（结构、内容、押韵设置）保存到 localStorage，附带时间戳和自定义标签。
- **localStorage 键设计**：`lyriclab_autosave`、`lyriclab_version_{timestamp}`，版本元数据索引存储在 `lyriclab_version_index`。
- **版本管理面板**：时间线展示所有已保存版本。点击任一版本：
  - 并排对比视图（当前编辑 vs 版本内容左右对照，差异句子高亮）。
  - 可"恢复此版本"（覆盖当前内容，恢复前自动保存当前状态到临时备份，支持撤销恢复）。
- 版本管理逻辑封装在 `versionService.js`。

### 5. 歌词排版预览
- "预览"模式：模拟手机竖屏歌词海报效果，居中显示歌词全文，段落分明。
- 提供 2-3 种预设字体和背景色，适合截图分享。
- 预览组件独立，与编辑器数据双向绑定但不互相污染。

### 6. 撤销/重做与自动保存
- 编辑器支持完整的撤销/重做栈（Ctrl+Z / Ctrl+Y 及工具栏按钮）。操作粒度为：文本修改、段落增删、押韵设置变更。
- 撤销栈通过命令模式（Command Pattern）或不可变状态实现，封装在 `store/` 或自定义 hook 中。
- **自动保存**：每次编辑操作后 debounce 2 秒，将当前状态保存到 localStorage。页面加载时检查并恢复自动保存内容，恢复时提示"已恢复未保存内容"。

### 7. 用户认证系统
- **注册**：用户输入邮箱 + 密码（≥8位，含字母和数字）完成注册。前端做基本格式校验，后端做邮箱唯一性检查。密码经 bcrypt 加盐哈希后存入 PostgreSQL `users` 表。
- **登录**：邮箱 + 密码登录，后端验证后返回 JWT（access token 有效期 2h + refresh token 有效期 7d）。前端将 token 存入 httpOnly cookie 或 localStorage（优先 cookie，防 XSS）。
- **Token 刷新**：access token 过期时，前端自动用 refresh token 换取新 access token，用户无感知。refresh token 也过期则跳转登录页。
- **前端路由守卫**：未登录用户可访问编辑器主页（离线模式）；登录相关功能（云端同步、在线歌曲搜索）需登录后才显示，点击时弹出登录引导弹窗。
- **登录状态持久化**：页面刷新后从 token 恢复登录态，显示用户头像（默认字母头像）和邮箱。
- **后端中间件**：Express 中间件解析 Authorization header，验证 JWT，将 `userId` 注入 `req.user`。需要认证的路由使用该中间件。
- **相关接口**：
  - `POST /api/auth/register` — 注册
  - `POST /api/auth/login` — 登录，返回 `{accessToken, refreshToken}`
  - `POST /api/auth/refresh` — 刷新 access token
  - `GET /api/auth/me` — 获取当前用户信息

### 8. 歌词爬虫与数据库
- **数据库设计**（PostgreSQL）：
  ```
  users:          id, email, password_hash, created_at
  songs:          id, title, artist, source_url, source_platform, crawled_at
  lyrics:         id, song_id (FK), section_order, section_title, line_order, line_text
  crawl_logs:     id, platform, status, songs_found, error_message, crawled_at
  user_versions:  id, user_id (FK), song_id (FK, nullable), content(JSONB), label, created_at
  ```
- **爬虫调度**：`crawler/index.ts` 使用 node-cron 定时触发（默认每天凌晨 2:00 执行，频率可通过环境变量配置）。每次爬取结果记录到 `crawl_logs` 表便于排查。
- **爬虫源适配**：每个歌词网站封装为独立的 source adapter（`sources/qqMusic.ts`、`sources/neteaseMusic.ts`），统一实现 `fetchHotSongs(limit: number)` 和 `fetchLyric(songId: string)` 接口。新增爬虫源只需添加新 adapter 文件。
- **歌词解析**：`parser.ts` 负责将从网页抓取的文本清洗为结构化数据：去 HTML 标签 → 分行 → 识别段落标题（如 `[主歌]`、`[副歌]`）→ 输出 `{section, lines[]}` 格式。
- **去重策略**：入库前根据 `title + artist` 组合查重，已存在的歌曲跳过（更新 `crawled_at` 时间戳即可）。
- **搜索 API**：前端搜索框调用 `GET /api/songs?keyword=xxx`，后端对 `songs` 表做 `ILIKE` 模糊查询，返回匹配的歌曲列表。点击歌曲后通过 `GET /api/songs/:id` 获取完整歌词。
- **降级策略**：后端不可用时，前端回退到内置的 10 首示例歌曲数据（`songService.js` 中的 hardcoded fallback），确保离线可用。

## 二、API 接口设计

所有接口前缀 `/api`，返回 JSON，统一格式 `{ code: 0, data: ... }` 成功 / `{ code: number, message: string }` 错误。需要认证的接口标注 `[Auth]`。

### Auth
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册（email + password） |
| POST | `/api/auth/login` | 登录，返回 accessToken + refreshToken |
| POST | `/api/auth/refresh` | 刷新 accessToken |
| GET | `/api/auth/me` | `[Auth]` 获取当前用户信息 |

### Songs
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/songs` | 搜索歌曲（`?keyword=xxx&page=1&limit=20`） |
| GET | `/api/songs/:id` | 获取歌曲详情（含完整歌词） |
| GET | `/api/songs/hot` | 获取热门歌曲列表（首页推荐） |

### Versions（登录用户云端同步）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/versions` | `[Auth]` 获取用户保存的版本列表 |
| POST | `/api/versions` | `[Auth]` 保存新版本 |
| GET | `/api/versions/:id` | `[Auth]` 获取版本详情 |
| DELETE | `/api/versions/:id` | `[Auth]` 删除版本 |

### Crawler（管理端，可加权限控制）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/crawler/trigger` | 手动触发一次爬取 |
| GET | `/api/crawler/logs` | 查看爬取日志 |
| GET | `/api/crawler/stats` | 爬取统计（歌曲总量、上次爬取时间等） |

---

## 三、UI/UX 设计要求
- **认证界面**：
  - 登录/注册弹窗或独立页面，居中卡片式布局，极简风格（仅邮箱、密码、按钮）。
  - 表单校验实时反馈（邮箱格式、密码强度），错误提示直接显示在输入框下方。
  - 登录后顶栏显示用户头像（字母头像，取邮箱首字母大写）和邮箱前缀，点击展开下拉菜单（云端版本 / 退出登录）。
- **响应式设计**：桌面端三栏布局；移动端（<768px）折叠为单栏，通过底部 Tab 或抽屉切换面板。使用 CSS 媒体查询或 Tailwind 断点。
- **界面风格**：现代简约，柔和中性色调，圆角卡片、细腻阴影。CSS 变量定义主题色便于切换。编辑器为视觉焦点，行高 1.6-1.8，字号 ≥16px。
- **操作指引**：首次加载显示半透明蒙层教程（Onboarding Overlay），介绍核心区域和快捷操作，可跳过。工具栏常驻"帮助"图标可重新查看。
- **状态反馈**：
  - 导入、导出、保存版本等操作使用 Toast 通知（顶部居中，2-3 秒自动消失）。
  - 异步操作显示骨架屏或加载指示器。
  - 错误状态有明确的错误提示和恢复建议。
- **可访问性**：按钮 ≥44×44px 触摸友好区域；重要功能具备键盘快捷键；教程中列出快捷键表。

---

## 四、数据与逻辑细节
- **拼音处理**：使用 `pinyin-pro` 库的 `pinyin()` 函数获取拼音数组，提取声母、韵母、声调。多音字按常见读音处理即可，不要求精准消歧。封装在 `utils/pinyin.js`。
- **押韵判断**：基于韵母匹配（严格/宽松模式可配置）。平仄基于声调判断（1-2 声平，3-4 声仄，轻声归平）。封装在 `services/rhymeService.js`。
- **示例歌曲数据**：`server/src/db/seed.ts` 负责填充初始种子数据（≥10 首），之后由爬虫持续扩充。前端 `songService.js` 优先调用后端 API，异常时使用内置 fallback。
- **状态管理**：使用 Pinia（Vue）或 Zustand（React）管理全局编辑器状态（当前歌词结构、押韵设置、字数限制、撤销栈）和认证状态（用户信息、token）。
- **数据库迁移**：使用 Prisma 的 `prisma migrate dev` 或 Knex migrations 管理表结构变更，确保可复现。`.env.example` 提供 `DATABASE_URL`（指向 `lyric_lab` 数据库）、`JWT_SECRET`、`CRAWL_INTERVAL` 等环境变量模板。
- **爬虫合规**：爬虫仅抓取公开可见的歌词页面，设置合理请求间隔（≥2s/次），遵守 robots.txt，在 User-Agent 中标识用途。

---

## 五、输出要求
- 输出完整的全栈工程项目，代码按上述模块拆分，前后端分离：`frontend/` + `server/`。
- 代码结构清晰，命名规范，关键函数有简要注释说明 WHY 而非 WHAT。
- 提供 `.env.example` 文件列出所有所需环境变量（示例 `DATABASE_URL=postgresql://postgres:123456@localhost:5432/lyric_lab`），提供 `docker-compose.yml`（可选）快速启动 PostgreSQL。
- 提供 `README.md`，包含：项目简介、技术栈、环境准备（PostgreSQL 安装/连接）、启动方式（`npm install && npx prisma migrate dev && npm run dev`）、项目结构说明。
- **前端可独立运行**：未启动后端时，编辑器核心功能（编辑、押韵检测、版本管理、导出）完全可用。后端用于增强：在线歌曲搜索、账户系统、云端同步。
- 确保核心功能完整可运行：搜索选歌、文本导入、编辑、押韵实时检测、字数限制反馈、撤销重做、版本对比、TXT/LRC/HTML 导出、自动保存恢复、邮箱注册登录、爬虫定时入库、响应式布局。
