# 模块一（Tech Explorer）实现计划

> 范围：仅实现 SPEC 第 3 节「技术介绍」模块。其他三个模块（政策/产业/市场）以及底部 Agent 对话框**不在本次实现范围**，但目录结构为其预留位置。
> 技术栈：Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand（前端）／ FastAPI + JSON（后端）

---

## 1. 目录结构（仅列出本轮会创建的文件）

```
hackathlon/
├── SPEC.md
├── PLAN.md
├── .gitignore                          # 新增或补充 node_modules / __pycache__ / .venv
│
├── backend/
│   ├── requirements.txt                # fastapi, uvicorn[standard], pydantic
│   ├── main.py                         # FastAPI app，注册 CORS + 路由
│   ├── data/
│   │   └── technologies.json           # 具身智能示范数据（本计划第 4 节定义）
│   └── routers/
│       ├── __init__.py
│       └── tech.py                     # GET /api/technologies, /api/technologies/{id}
│
└── frontend/
    ├── index.html                      # 入口 HTML，挂 #root
    ├── package.json                    # 依赖 & 脚本
    ├── vite.config.ts                  # 配置 /api → http://localhost:8000 代理
    ├── tsconfig.json                   # TS 编译配置
    ├── tsconfig.node.json
    ├── tailwind.config.ts              # 深色主题色板 + 霓虹发光 box-shadow
    ├── postcss.config.js
    ├── .eslintrc.cjs                   # 可选，保持简洁
    └── src/
        ├── main.tsx                    # React 挂载入口
        ├── App.tsx                     # 顶部技术选择器 + 模块一容器
        ├── index.css                   # Tailwind 三指令 + 全局深色背景 + 霓虹样式
        ├── lib/
        │   ├── types.ts                # Technology 等 TS 类型（和后端同构）
        │   └── api.ts                  # fetch 封装，调用 /api/technologies
        ├── store/
        │   └── techExplorer.ts         # Zustand：当前选中技术、hover 部件、活动子技术、卡片开关
        └── components/
            ├── Dashboard.tsx           # 骨架：顶栏 + 四 Tab（仅"技术介绍"可用，其他置灰）
            └── TechExplorer/
                ├── index.tsx           # 模块一根容器，负责数据拉取 & 状态联动
                ├── TechDiagram.tsx     # SVG 主图：三大类热区（感知/运动/决策）
                ├── ExplodeAnimation.tsx# Framer Motion 爆炸拆解包装组件
                ├── KeywordBubble.tsx   # 关键词气泡（圆角 + 霓虹发光）
                └── TechCard.tsx        # 侧边滑入技术详情面板（ESC / 点外部关闭）
```

---

## 2. 后端设计（FastAPI）

### 2.1 `backend/requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
```

### 2.2 `backend/main.py` 职责

- 创建 `FastAPI(title="TechPolicy Dashboard API")`
- 配置 CORS：允许 `http://localhost:5173`（开发期）与 `*`（黑客松便利）
- 挂载 `routers.tech.router`，前缀 `/api`
- `GET /api/health` → `{"status": "ok"}` 用作连通性探针

### 2.3 `backend/routers/tech.py` 职责

- 启动时一次性读 `backend/data/technologies.json` 到内存
- `GET /api/technologies` → 返回**树形**结构：`{ id, name, categories: [{ id, name, children: [tech...] }] }`
  - 前端主视图需要三大类标签和每类下的子技术关键词，一次请求拿齐
- `GET /api/technologies/{tech_id}` → 返回**单个子技术完整卡片**（含 description、capabilitySummary、recentAchievements）
- 未找到返回 `404 {"detail": "technology not found"}`

### 2.4 数据文件说明

`backend/data/technologies.json` 的 schema 与 SPEC §8.1 `Technology` 对齐，但为模块一单独使用简化为一棵树（单根 = 具身智能）。本计划第 4 节给出完整数据。

---

## 3. 前端设计

### 3.1 脚手架关键配置

**`vite.config.ts`**
- React 插件
- `server.port = 5173`
- `server.proxy['/api'] = { target: 'http://localhost:8000', changeOrigin: true }`

**`tailwind.config.ts`**
- `darkMode: 'class'`（全局 body 加 `class="dark"`）
- 扩展调色板（Bloomberg Terminal 风格）：
  - `bg.base` `#0a0e1a`（近黑深蓝）
  - `bg.panel` `#111827`
  - `border.neon` `#1f2937`
  - `accent.cyan` `#22d3ee`（青色霓虹，主强调）
  - `accent.amber` `#f59e0b`（橙色霓虹，hover/高亮）
  - `accent.magenta` `#e879f9`（品红，关联线）
  - `text.primary` `#e5e7eb`，`text.muted` `#6b7280`
- 扩展 `boxShadow`：
  - `neon-cyan: 0 0 8px rgba(34,211,238,0.6), 0 0 24px rgba(34,211,238,0.25)`
  - `neon-amber: 0 0 8px rgba(245,158,11,0.6), 0 0 24px rgba(245,158,11,0.25)`
- 字体：等宽 `JetBrains Mono` + 中文 `Noto Sans SC`（`fontFamily.mono/sans`）

**`src/index.css`** 顶部加 `@tailwind base/components/utilities`；`body` 设 `bg-bg-base text-text-primary font-sans`；为 SVG 提供 `.neon-stroke` 工具类（filter: drop-shadow）。

### 3.2 Zustand Store — `src/store/techExplorer.ts`

```ts
interface TechExplorerState {
  rootTech: TechTree | null;           // /api/technologies 返回
  loading: boolean;
  hoveredCategoryId: string | null;    // 当前 hover 的大类（感知/运动/决策）
  activeTechId: string | null;         // 点击气泡后打开卡片的子技术
  techDetail: TechnologyDetail | null; // /api/technologies/{id} 缓存
  // actions
  loadRoot(): Promise<void>;
  setHoveredCategory(id: string | null): void;
  openTech(id: string): Promise<void>;
  closeCard(): void;
}
```

- `openTech` 先从缓存取，否则请求后端
- `closeCard` 将 `activeTechId` 和 `techDetail` 置空

### 3.3 组件职责细化

**`App.tsx`** — 渲染 `<Dashboard />`；页面级 effect 在挂载时触发 `loadRoot()`。

**`Dashboard.tsx`** — 布局骨架：
- 顶栏：左 logo 文字「TechPolicy Dashboard」，右四个 Tab：`技术介绍` `政策动向(敬请期待)` `产业场景(敬请期待)` `市场动向(敬请期待)`
- 中部：当前仅渲染 `<TechExplorer />`
- 底部：预留「Agent 对话框」占位区（灰色条 + "coming soon"），给整体视觉完整感
- Tab 样式：选中 = 青色下划线 + 发光；禁用 = 低饱和度 + `cursor-not-allowed`

**`TechExplorer/index.tsx`** — 模块根：
- 从 store 取 `rootTech` `hoveredCategoryId` `activeTechId`
- 左侧 2/3：`<TechDiagram />`（主图）
- 右侧 1/3：当 `activeTechId` 存在时显示 `<TechCard />`，否则显示"提示引导区"：一段小字「悬停任一系统以拆解，点击关键词查看详情」+ 三大类 legend
- 顶部小标题：「具身智能 · Embodied AI」+ 副标题灰色英文
- 加一个微型"坐标"装饰（Bloomberg 风格，显示更新时间、节点数），放在右上角

**`TechDiagram.tsx`** — 可视化主图：
- 固定 viewBox（例如 900×560），直接用 SVG 基本图形（不要求精确机器人插画，黑客松用抽象几何形足够）
  - 中心一个代表"具身智能主体"的八边形（`<polygon>`），描边青色
  - 三大类围绕中心 120° 分布：感知系统（上）、运动控制（右下）、决策智能（左下）
  - 每个大类是一个发光圆角矩形（`<rect rx>` + filter glow），里面写大类中文名
  - 中心到三大类的连线：`<line>` + `stroke-dasharray="4 4"` + 青色半透明
- hover 大类区：
  - 该大类描边换 `accent.amber`，阴影加强（切换 className）
  - 调用 `setHoveredCategory(categoryId)`
  - 在该大类周围挂载 `<ExplodeAnimation categoryId=...>`
- 离开（`onMouseLeave`）：`setHoveredCategory(null)`，ExplodeAnimation 的 `AnimatePresence` 退出动画收回
- 为保证 hover 期间进入子气泡不触发大类的 leave，整个"大类 + 它的气泡"放在一个共用的 `onMouseEnter/Leave` 容器里（使用一个 wrapper `<g>`）

**`ExplodeAnimation.tsx`** — 爆炸拆解包装：
- props: `categoryId`, `center: {x,y}`, `children: KeywordBubble[]` （或接收技术数组自行渲染）
- 内部：用 Framer Motion `<AnimatePresence>` + 每个子技术一个 `motion.g`
- 子气泡初始 `scale: 0.3, opacity: 0` 定位在 `center`；`animate` 到放射状位移（按 index 计算角度，半径 110px）
- `transition: { type: 'spring', stiffness: 200, damping: 18, delay: index * 0.04 }`
- exit 回到 center、opacity 归 0

**`KeywordBubble.tsx`** — 关键词气泡：
- 外层 `<g>` + 内部 `<rect>` 圆角 + `<text>`
- 常态：深背景 + 青色描边 + 轻微发光
- hover 气泡：描边换 amber，光晕加强，`cursor-pointer`
- `onClick` → `openTech(techId)`
- 文本用 3–5 字关键词（"伺服电机""强化学习"）；更详细解释留给 TechCard

**`TechCard.tsx`** — 右侧滑入面板：
- 用 Framer Motion `motion.aside`：`initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}`
- 宽度 380px，高度填满模块一区域，深色面板 + 左侧青色发光边 `border-l-2 border-accent-cyan shadow-neon-cyan`
- 内容分块：
  1. 顶部：关键词名 + 所属大类 tag + 右上角 `×` 关闭按钮
  2. 名词解释（`description`，100 字通俗）
  3. 能力边界（`capabilitySummary`，能做 / 做不到 双栏小卡片）
  4. 近期成果（`recentAchievements[]`，列表：日期 · 标题 · 来源链接）
  5. 底部两个按钮：「查看相关政策」「查看产业应用」→ 当前置灰并 `title="模块二/三开发中"`
- 关闭行为：
  - 点击 `×` 按钮
  - 监听全局 `keydown`（ESC）
  - 点击面板外（在模块容器上放透明遮罩或用 `onPointerDownOutside` 逻辑）
- 请求态：`techDetail` 还没回来时显示"数据加载中…"骨架

### 3.4 API 封装 — `src/lib/api.ts`

```ts
const base = '/api';
export async function getTechRoot(): Promise<TechTree> { ... }
export async function getTechDetail(id: string): Promise<TechnologyDetail> { ... }
```

- 简单 `fetch` + `res.ok` 检查 + `res.json()`
- 错误时 `throw new Error(await res.text())`，store 层捕获打印 console.error

---

## 4. 示范数据：`backend/data/technologies.json`

完整内容（直接可用）：

```json
{
  "id": "embodied-ai",
  "name": "具身智能",
  "nameEn": "Embodied AI",
  "tagline": "让 AI 拥有身体，能在物理世界感知、行动、决策",
  "categories": [
    {
      "id": "perception",
      "name": "感知系统",
      "nameEn": "Perception",
      "children": [
        {
          "id": "computer-vision",
          "name": "计算机视觉",
          "shortLabel": "计算机视觉",
          "description": "让机器人通过摄像头识别物体、人脸、场景和空间结构，相当于机器的'眼睛'。",
          "capabilityCan": [
            "在良好光照下识别常见物体和人脸",
            "估计物体距离、三维位姿",
            "结合深度相机做室内 SLAM 建图"
          ],
          "capabilityCannot": [
            "完全透明/高反光物体识别",
            "极暗或烟雾等复杂环境",
            "未见过品类的可靠零样本识别"
          ],
          "recentAchievements": [
            { "title": "Meta SAM 2 实现视频任意物体分割", "date": "2024-07", "source": "https://ai.meta.com/sam2/" },
            { "title": "特斯拉 Optimus 纯视觉方案量产迭代", "date": "2025-01", "source": "https://www.tesla.com/AI" }
          ]
        },
        {
          "id": "force-sensor",
          "name": "力觉传感器",
          "shortLabel": "力觉传感",
          "description": "安装在机器人关节或末端的传感器，能感知受力大小和方向，让机器人知道'抓得稳不稳、推得重不重'。",
          "capabilityCan": [
            "六维力/力矩测量",
            "精密装配中的柔顺控制",
            "抓取力度闭环调节"
          ],
          "capabilityCannot": [
            "低成本高精度仍难两全",
            "极小接触力（<0.1N）难稳定测量",
            "长期使用后零漂需校准"
          ],
          "recentAchievements": [
            { "title": "ATI 多轴力传感器用于波士顿动力 Atlas 装配任务", "date": "2024-10", "source": "https://www.ati-ia.com/" },
            { "title": "国产宇立仪器六维力传感器出货量翻倍", "date": "2025-03", "source": "https://www.sri-instruments.com/" }
          ]
        },
        {
          "id": "tactile-skin",
          "name": "触觉反馈",
          "shortLabel": "电子皮肤",
          "description": "覆盖在机器人表面的柔性传感阵列，模拟人类皮肤对压力、温度、纹理的感知，是精细操作的关键。",
          "capabilityCan": [
            "分布式接触点检测",
            "软物体（布料、水果）抓取",
            "触觉与视觉融合感知"
          ],
          "capabilityCannot": [
            "大面积全身覆盖成本仍高",
            "抗磨损耐用性不足",
            "触觉数据标准化尚未形成"
          ],
          "recentAchievements": [
            { "title": "MIT CSAIL 发布高分辨率触觉手套", "date": "2024-06", "source": "https://www.csail.mit.edu/" },
            { "title": "Meta Digit 360 开源触觉传感器", "date": "2024-11", "source": "https://digit.ml/" }
          ]
        }
      ]
    },
    {
      "id": "motion",
      "name": "运动控制",
      "nameEn": "Motion Control",
      "children": [
        {
          "id": "servo-motor",
          "name": "伺服电机",
          "shortLabel": "伺服电机",
          "description": "能够精确控制转动角度、速度和扭矩的电机，是机器人关节的'肌肉'。性能直接决定了机器人运动的精度和响应速度。",
          "capabilityCan": [
            "亚毫米级位置控制精度",
            "毫秒级响应速度",
            "一体化关节模组降低集成难度"
          ],
          "capabilityCannot": [
            "高扭矩密度与低成本难兼得",
            "长期满载下发热和寿命问题",
            "极端环境（高温、强辐射）可靠性不足"
          ],
          "recentAchievements": [
            { "title": "绿的谐波谐波减速器+伺服一体关节量产", "date": "2024-12", "source": "https://www.leaderdrive.com/" },
            { "title": "宇树 H1 使用自研高扭矩关节达成跑步", "date": "2024-03", "source": "https://www.unitree.com/" }
          ]
        },
        {
          "id": "joint-control",
          "name": "关节控制",
          "shortLabel": "关节协调",
          "description": "让机器人多个关节协调运动的算法，保证整体动作既稳又准。人形机器人通常需要同时控制 20–40 个关节。",
          "capabilityCan": [
            "双足静态/动态平衡",
            "全身动力学模型预测控制",
            "模仿学习快速复现人类动作"
          ],
          "capabilityCannot": [
            "未知地面的极限鲁棒性",
            "受冲击后的自恢复",
            "能耗优化仍显著落后于生物"
          ],
          "recentAchievements": [
            { "title": "波士顿动力全电动 Atlas 发布", "date": "2024-04", "source": "https://bostondynamics.com/" },
            { "title": "宇树 H1 完成室外越野行走测试", "date": "2025-02", "source": "https://www.unitree.com/" }
          ]
        },
        {
          "id": "path-planning",
          "name": "路径规划",
          "shortLabel": "路径规划",
          "description": "计算从起点到目标点的最优移动轨迹，同时避开障碍物。既要考虑几何可行，也要考虑时间、能耗。",
          "capabilityCan": [
            "静态环境下快速全局规划",
            "动态避障反应式调整",
            "与 SLAM 结合的在线重规划"
          ],
          "capabilityCannot": [
            "人群密集环境下的社交感知规划",
            "长时域多目标任务规划",
            "完全未建图环境下的高速导航"
          ],
          "recentAchievements": [
            { "title": "NVIDIA Isaac 发布 cuRobo GPU 加速规划", "date": "2024-08", "source": "https://developer.nvidia.com/isaac/" },
            { "title": "Figure 02 工厂场景实时路径规划落地", "date": "2025-01", "source": "https://www.figure.ai/" }
          ]
        }
      ]
    },
    {
      "id": "cognition",
      "name": "决策智能",
      "nameEn": "Cognition",
      "children": [
        {
          "id": "llm-agent",
          "name": "大语言模型",
          "shortLabel": "大语言模型",
          "description": "像 ChatGPT 一样的大模型装进机器人大脑，让机器人能听懂自然语言指令，并把'把桌上的杯子递给我'拆成一系列可执行动作。",
          "capabilityCan": [
            "自然语言理解任务指令",
            "高层任务拆解为子步骤",
            "多模态输入（图像+语言）"
          ],
          "capabilityCannot": [
            "精确物理数值推理仍不稳定",
            "长时序任务中易遗忘",
            "端侧部署功耗与时延受限"
          ],
          "recentAchievements": [
            { "title": "Google RT-2 视觉-语言-动作模型", "date": "2023-07", "source": "https://robotics-transformer2.github.io/" },
            { "title": "Figure 02 接入 OpenAI 完成家庭场景 Demo", "date": "2024-08", "source": "https://www.figure.ai/" }
          ]
        },
        {
          "id": "reinforcement-learning",
          "name": "强化学习",
          "shortLabel": "强化学习",
          "description": "通过'试错 + 奖励'让机器人自己学会怎么做任务，就像训练小孩骑自行车一样。大量训练在仿真环境中完成，再迁移到真机。",
          "capabilityCan": [
            "仿真环境中大规模并行训练",
            "Sim-to-Real 迁移基本可行",
            "步态、抓取等技能自动习得"
          ],
          "capabilityCannot": [
            "高样本效率的真实世界学习",
            "安全约束下的探索",
            "奖励函数设计仍高度依赖人工"
          ],
          "recentAchievements": [
            { "title": "ETH ANYmal 纯 RL 完成山地徒步", "date": "2024-05", "source": "https://rsl.ethz.ch/" },
            { "title": "NVIDIA GR00T 人形机器人基础模型发布", "date": "2024-03", "source": "https://developer.nvidia.com/project-gr00t" }
          ]
        },
        {
          "id": "world-model",
          "name": "世界模型",
          "shortLabel": "世界模型",
          "description": "机器人大脑里的'物理小宇宙'，它能预测'如果我这样动，物体会怎样运动'，相当于让机器人在脑子里先排练一遍再执行。",
          "capabilityCan": [
            "短时域物理动力学预测",
            "视频生成作为可学习仿真器",
            "作为策略训练的可微环境"
          ],
          "capabilityCannot": [
            "长时域精确物理预测",
            "完全替代传统物理引擎",
            "与刚体/软体精确接触建模"
          ],
          "recentAchievements": [
            { "title": "Google DeepMind Genie 2 交互式世界模型", "date": "2024-12", "source": "https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/" },
            { "title": "NVIDIA Cosmos 世界基础模型开放", "date": "2025-01", "source": "https://www.nvidia.com/en-us/ai/cosmos/" }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. 执行步骤（先后端 → 再前端 → 再联调）

### 阶段 A：后端骨架（目标：`curl localhost:8000/api/technologies` 能返回数据）

1. 创建 `backend/` 目录与 `requirements.txt`、`main.py`、`routers/tech.py`、`data/technologies.json`
2. 在 `backend/` 下 `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
3. 写入第 4 节的示范数据到 `technologies.json`
4. 实现 `main.py`（CORS + 路由挂载 + `/api/health`）和 `tech.py`（树形接口 + 详情接口）
5. 启动：`uvicorn main:app --reload --port 8000`（后台运行），`curl http://localhost:8000/api/health` 验证，再 `curl /api/technologies | jq` 验证结构

### 阶段 B：前端脚手架（目标：`npm run dev` 出现深色空白页）

6. `cd frontend && npm create vite@latest . -- --template react-ts`（或手动写 package.json）
7. 安装：`npm i framer-motion zustand` + `npm i -D tailwindcss postcss autoprefixer @types/node`
8. `npx tailwindcss init -p`，按第 3.1 节修改 `tailwind.config.ts` 与 `postcss.config.js`
9. 改 `vite.config.ts` 加 `/api` proxy
10. 写 `src/index.css`、`src/main.tsx`、`src/App.tsx` 最小版（深色背景 + 「TechPolicy Dashboard」标题），`npm run dev` 访问 `http://localhost:5173` 确认深色主题生效

### 阶段 C：数据层打通（目标：控制台打印出拉回的 JSON）

11. 写 `src/lib/types.ts`（`TechCategory` `TechChild` `TechTree` `TechnologyDetail`）
12. 写 `src/lib/api.ts`（两个 fetch 函数）
13. 写 `src/store/techExplorer.ts`（Zustand store）
14. `App.tsx` 挂载时调用 `loadRoot()`，先在页面打印 JSON 文本确认联通

### 阶段 D：模块一组件（目标：完整三层交互）

15. 写 `Dashboard.tsx`：顶栏 + 四 Tab（只有"技术介绍"可用）+ 底部 Agent 占位条
16. 写 `TechExplorer/index.tsx`：2/3 + 1/3 布局骨架 + 引导提示
17. 写 `TechDiagram.tsx`：
    - 静态 SVG（中心节点 + 三大类 + 连线）
    - 三大类的 hover 状态（描边换色 + 发光加强）
    - wrapper `<g>` 负责 `onMouseEnter/Leave` 调 `setHoveredCategory`
18. 写 `KeywordBubble.tsx`：单独气泡组件（SVG），props 接收 `label` `onClick`
19. 写 `ExplodeAnimation.tsx`：
    - 读 hoveredCategoryId 对应的 children
    - 按索引计算放射角度 + 半径
    - 用 `AnimatePresence` 挂载多个 `<motion.g>` 承载 `<KeywordBubble>`
    - 测试：hover 大类 → 气泡从中心炸出 → 移开 → 收回
20. 写 `TechCard.tsx`：
    - `motion.aside` 滑入滑出
    - 根据 `techDetail` 渲染四块内容
    - 绑定 ESC 关闭、右上 × 关闭
    - 底部两个"敬请期待"按钮
21. 串联：点击 `KeywordBubble` → `openTech(id)` → Store 请求详情 → `TechCard` 渲染

### 阶段 E：视觉打磨（目标：达到 Bloomberg Terminal + 霓虹的统一质感）

22. 全局背景加等宽网格底纹（CSS `background-image: linear-gradient(...)`，低透明）
23. 三大类用不同霓虹强调色（感知=青，运动=琥珀，决策=品红），保持 legend 一致
24. 连线加 `filter: drop-shadow(...)` 实现霓虹发光
25. 顶栏右上放一个伪"数据指示灯"：绿色圆点脉冲动画 + `API · 200 OK` 文本
26. 字体等宽 JetBrains Mono 用于数字/英文，中文用 Noto Sans SC
27. 动画时长统一：hover 进入 ≤ 220ms，气泡回收 ≤ 180ms，卡片滑入 260ms（Framer `transition` 统一配置）

### 阶段 F：联调与演示（目标：一键能跑）

28. 根目录加一个 `README.md`（可选）或至少在 PLAN.md 备注启动命令：
    - 后端：`cd backend && uvicorn main:app --reload --port 8000`
    - 前端：`cd frontend && npm run dev`
29. 手工走 demo 路径：进入 → hover 感知系统 → 看见三个气泡 → 点击"计算机视觉" → 右侧卡片滑入 → ESC 关闭 → hover 运动控制 → 点击"伺服电机" → 再关闭
30. 补 `.gitignore`：`frontend/node_modules`、`frontend/dist`、`backend/.venv`、`backend/__pycache__`

---

## 6. 视觉风格落实点（对照 SPEC §10）

| 要求 | 落实方式 |
|------|--------|
| 深色主题 | Tailwind `darkMode: class` + body 背景 `#0a0e1a` |
| 霓虹可视化 | 自定义 `shadow-neon-cyan/amber/magenta` + SVG `filter: drop-shadow` |
| Bloomberg Terminal 风格 | 等宽字体 JetBrains Mono、网格底纹、右上角数据指示灯、所有标签带英文副标 |
| 关联线半透明虚线 | `stroke="rgba(34,211,238,0.35)" stroke-dasharray="4 4"` |
| 气泡圆角 + 微发光 | SVG `<rect rx=10>` + `filter: drop-shadow(0 0 6px accent)` |
| 动画克制 | Framer `transition` 统一 spring，禁用过度回弹（damping ≥ 18） |

---

## 7. 验收标准（完成态）

- [ ] `uvicorn` 启动后，`/api/technologies` 返回完整树（含 3 大类 × 3 子技术 = 9 条）
- [ ] `/api/technologies/computer-vision` 返回含 description / capabilityCan / capabilityCannot / recentAchievements 的详情
- [ ] 前端 `npm run dev` 启动后，浏览器显示深色 Bloomberg 风格页面
- [ ] 顶栏四 Tab 只有"技术介绍"可点，其他三个置灰
- [ ] 主图中心 + 三大类布局正确，默认态安静（无动画抖动）
- [ ] Hover 任一大类：本类描边换 amber + 发光加强 + 3 个关键词气泡放射炸出
- [ ] 鼠标移开大类+气泡群整体：气泡回收，大类回到青色
- [ ] 点击任一气泡：右侧 TechCard 从右侧滑入，渲染四块内容
- [ ] ESC / 点击右上 × / 点击面板外任一方式可关闭 TechCard
- [ ] 底部两个跳转按钮置灰并有 tooltip「模块二/三开发中」
- [ ] 切换不同大类 + 不同子技术的完整路径顺滑无错
- [ ] 控制台无 CORS / 404 / 未处理 Promise 错误

---

## 8. 不在本轮范围（明确边界）

- 模块二（政策动向）、模块三（产业场景）、模块四（市场动向）
- 底部对话框 Agent 真实交互（仅放占位条）
- 「查看相关政策 / 产业应用」按钮的实际跳转（仅置灰）
- 会话记忆 / 分叉 / 返回机制
- 移动端适配（桌面优先，宽度固定 ≥ 1280px）
- 部署（Vercel / VPS）
