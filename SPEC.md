# 科技政策综合看板 — 技术规格文档

## Hackathon Spec: TechPolicy Dashboard

---

## 1. 项目概述

### 1.1 我们要做什么

一个面向**政府科技部门非技术人员**的交互式综合看板。目标用户是科委、发改委、工信部等体制内负责撰写科技政策研究报告的研究员——他们需要理解前沿技术，但自身不是技术背景。

### 1.2 解决什么问题

政策热词 ↔ 具体技术之间缺乏桥梁。写稿子的人看到"具身智能""算力网""脑机接口"这些词，不知道它具体是什么、和哪些政策相关、在产业里怎么落地。导致写出来的政策"发空"。

### 1.3 核心设计原则

- **渐进式披露**：不要一次堆文字。关键词 → 点击展开 → 详细内容
- **可视化优先**：图 + 关键词引导，文字藏在下一层
- **三个关联轴**：技术 ↔ 政策 ↔ 产业，三者互通
- **面向忙碌的人**：5分钟内能理解一个技术的全貌

---

## 2. 看板四大模块

### 模块一：技术介绍（Tech Explorer）

**目标**：让非技术人员"摸"到一个技术的结构。

**交互设计**：
1. **主视图**：一张技术的可视化大图（如具身智能 → 机器人全身图）
2. **Hover 层级**：鼠标悬浮到某部件 → 该部件高亮 → 浮出子组件气泡
3. **关键词层**：子组件旁显示 2-3 个技术关键词（不多，克制）
4. **点击下钻**：点击关键词 → 展开技术卡片：
   - 技术名词解释（100字以内，通俗语言）
   - 近期成果（2-3条，附来源链接）
   - 当前能力边界（能做到什么，做不到什么）
5. **动画效果**：hover 时部件"爆炸拆解"为零件，浮出关键词标签

**示例路径**：
```
机器人全身图
  → hover 手臂 → 手臂拆解为：关节、传感器、执行器
    → 点击"关节控制" → 展开技术卡片：
       - 名词解释：通过伺服电机和反馈算法实现精确运动控制
       - 近期成果：宇树 H1 实现后空翻（2024）
       - 能力边界：精密操作仍有挑战
```

### 模块二：政策动向（Policy Tracker）

**目标**：把抽象的政策文件和技术关键词建立可视化的关联。

**核心功能**：
1. **政策时间轴**：横轴为时间（2020-2026），纵轴为政策关键词
2. **政策收集**：展示各国/各部委与该技术相关的政策文件
3. **政策-技术关联线**：从政策词连一条线到模块一中对应的技术位置
   - 例：美国《芯片法案》→ 连线到"半导体制造"技术节点
4. **政策摘要**：每条政策附一段 100 字的通俗解读
5. **三部门视角**：按科委/工信部/发改委分类展示政策

**三部门资金逻辑**（重要背景知识）：
```
科委 → 科研项目、科研设施、技术攻关（散财投资，考核宽松）
  ↓
工信部 → 标准化建设、成果转化、产业配套（桥梁角色）
  ↓
发改委 → 经济发展、大额投资（最终出钱的人）
```

**政策层级展开**：
```
十五五规划（最宏观，每个字凝聚大量信息）
  → 部委级规划（科委/工信部/发改委各自的布局）
    → 具体政策文件（芯片法案、算力网规划等）
      → 关联到技术关键词
```

### 模块三：产业场景（Industry Chain）

**目标**：展示技术从实验室到产业的完整转化链条。

**核心功能**：
1. **产业链视图**：一条从"基础研究 → 工程实现 → 零部件 → 整机/系统 → 产业应用"的链条
2. **产业热词卡片**：展示十五五规划等国家级产业关键词
   - 如：算力网、数据基础设施建设、生物医药、商业航天
3. **产业-技术关联**：点击产业词 → 展示它对应模块一中的哪些基础技术
4. **产业-政策关联**：点击产业词 → 展示它对应模块二中的哪些政策
5. **政策时间轴**：底部横轴为政策时间线，上方浮着产业关键词节点

**交互示例**：
```
产业场景页面
  → 底部：政策时间轴（2022、2023、2024、2025...）
  → 上方浮着：算力网、生物医药、商业航天等产业词气泡
    → 点击"算力网" → 展开：
       - 文字介绍：什么是算力网
       - 产业链位置：GPU芯片 → 服务器 → 数据中心 → 算力调度 → 应用
       - 关联技术：连线回模块一的"并行计算""网络通信"等
       - 关联政策：连线回模块二的"东数西算"等
```

### 模块四：市场动向（Market Trends）

**目标**：展示技术在市场的最新动态和趋势。

> 注：语音转录中对第四模块描述较少，此处为合理推测补充。

**可能包含**：
1. 市场规模数据（饼图/柱状图）
2. 主要企业/玩家分布
3. 融资事件时间线
4. 技术成熟度曲线（Gartner Hype Cycle 风格）

---

## 3. 数据模型

### 3.1 核心实体

```
Technology（技术）
  - id, name, description（通俗解释）
  - category（类别：控制、感知、执行、智能...）
  - parent_id（所属大技术，如"具身智能"下有子技术）
  - capability_summary（当前能力边界）
  - recent_achievements[]（近期成果）
  - position（在可视化图中的坐标/区域）

Policy（政策）
  - id, title, country, department（部委）
  - date, summary（通俗摘要）
  - full_text_url（原文链接）
  - related_technologies[]（关联技术ID列表）
  - related_industries[]（关联产业ID列表）

Industry（产业）
  - id, name, description
  - national_plan_ref（所属国家规划，如"十五五"）
  - chain_position（产业链位置）
  - related_technologies[]（关联技术ID列表）
  - related_policies[]（关联政策ID列表）

IndustryChain（产业链）
  - id, industry_id
  - stages[]（基础研究→工程实现→零部件→整机→应用）
  - technology_mapping（每个环节对应哪些技术）
```

### 3.2 关联关系

三个模块通过 `related_technologies`、`related_policies`、`related_industries` 三个字段互相连接，形成知识图谱。

---

## 4. 技术架构

### 4.1 技术选型

| 层级 | 选型 | 理由 |
|------|------|------|
| **前端框架** | Next.js 15 (App Router) | SSR + 交互式 SPA，部署简单 |
| **UI 组件** | Tailwind CSS + shadcn/ui | 快速开发，风格统一 |
| **可视化** | D3.js + Framer Motion | D3 做数据驱动图表，Framer 做交互动画 |
| **图表** | Recharts / Nivo | 时间轴、柱状图等标准图表 |
| **状态管理** | Zustand | 轻量，适合多模块联动 |
| **数据存储** | JSON 文件 / SQLite | 黑客松阶段不需要复杂后端 |
| **部署** | Vercel / Cloudflare Pages | 零配置部署 |
| **AI 辅助** | OpenAI API / Claude API | 生成技术摘要、政策解读 |

### 4.2 项目结构

```
tech-policy-dashboard/
├── app/
│   ├── layout.tsx              # 全局布局，侧边栏导航
│   ├── page.tsx                # 首页：总览 + 技术选择
│   ├── tech/
│   │   └── [slug]/
│   │       └── page.tsx        # 模块一：技术介绍页
│   ├── policy/
│   │   └── page.tsx            # 模块二：政策动向页
│   ├── industry/
│   │   └── page.tsx            # 模块三：产业场景页
│   └── market/
│       └── page.tsx            # 模块四：市场动向页
├── components/
│   ├── TechExplorer/           # 技术可视化组件
│   │   ├── TechDiagram.tsx     # 主图 + 可点击区域
│   │   ├── ExplodeAnimation.tsx # 爆炸拆解动画
│   │   ├── KeywordBubble.tsx   # 关键词气泡
│   │   └── TechCard.tsx        # 技术详情卡片
│   ├── PolicyTracker/          # 政策组件
│   │   ├── PolicyTimeline.tsx  # 政策时间轴
│   │   ├── PolicyCard.tsx      # 政策卡片
│   │   ├── PolicyTechLink.tsx  # 政策-技术关联线
│   │   └── DepartmentFilter.tsx # 三部门筛选
│   ├── IndustryChain/          # 产业组件
│   │   ├── ChainView.tsx       # 产业链视图
│   │   ├── IndustryBubble.tsx  # 产业关键词气泡
│   │   └── IndustryDetail.tsx  # 产业详情面板
│   ├── MarketTrends/           # 市场组件
│   │   ├── MarketChart.tsx     # 市场数据图表
│   │   └── HypeCycle.tsx       # 技术成熟度曲线
│   └── shared/
│       ├── ConnectionLines.tsx  # 模块间的关联线（SVG）
│       ├── ProgressiveReveal.tsx # 渐进式披露通用组件
│       └── SourceLink.tsx      # 来源链接
├── data/
│   ├── technologies.json       # 技术数据
│   ├── policies.json           # 政策数据
│   ├── industries.json         # 产业数据
│   └── chains.json             # 产业链数据
├── lib/
│   ├── types.ts                # TypeScript 类型定义
│   └── data.ts                 # 数据加载函数
└── public/
    └── images/                 # 技术可视化图片资源
```

### 4.3 关键组件实现

#### TechDiagram.tsx — 技术可视化主图

```tsx
// 核心思路：SVG 热区 + hover 层级
// 1. 底图是一张 SVG 或高分辨率图片
// 2. 在图片上叠加透明的可点击 SVG 区域（path）
// 3. hover 时：该区域高亮 + 浮出子组件气泡
// 4. 点击时：触发爆炸动画 + 展开关键词

interface TechDiagramProps {
  technology: Technology;
  onPartHover: (partId: string) => void;
  onPartClick: (partId: string) => void;
  onKeywordClick: (keywordId: string) => void;
}
```

#### ExplodeAnimation.tsx — 爆炸拆解动画

```tsx
// 使用 Framer Motion 的 layout 动画
// 1. 原始状态：完整的技术图
// 2. hover 触发：部件向外散开，间距增大
// 3. 每个散开的部件旁浮出关键词标签
// 4. 鼠标移走：部件收回，恢复原状

import { motion, AnimatePresence } from 'framer-motion';
```

#### PolicyTimeline.tsx — 政策时间轴

```tsx
// 横轴时间线 + 上方浮着的政策关键词节点
// 节点可点击 → 展开政策卡片
// 政策卡片上有虚线连接到模块一中的技术节点

interface PolicyTimelineProps {
  policies: Policy[];
  onPolicyClick: (policyId: string) => void;
  highlightTech?: string; // 从模块一传入的高亮技术
}
```

#### ConnectionLines.tsx — 模块间关联线

```tsx
// SVG 覆盖层，绘制模块间的虚线关联
// 政策 ↔ 技术、产业 ↔ 技术、产业 ↔ 政策
// 使用 SVG path + stroke-dasharray 实现虚线效果
// 点击关联线 → 显示关联说明
```

---

## 5. 数据准备（黑客松阶段）

### 5.1 示范技术：具身智能（Embodied Intelligence）

为黑客松准备一个完整的技术作为展示案例：

```json
{
  "id": "embodied-ai",
  "name": "具身智能",
  "description": "让机器人像人一样感知和行动的智能技术",
  "parts": [
    {
      "id": "perception",
      "name": "感知系统",
      "keywords": ["计算机视觉", "力觉传感器", "触觉反馈"],
      "position": { "x": 120, "y": 80 }
    },
    {
      "id": "control",
      "name": "运动控制",
      "keywords": ["伺服电机", "关节控制", "路径规划"],
      "position": { "x": 200, "y": 200 }
    },
    {
      "id": "intelligence",
      "name": "决策智能",
      "keywords": ["大语言模型", "强化学习", "世界模型"],
      "position": { "x": 300, "y": 120 }
    }
  ]
}
```

### 5.2 政策数据（精选）

```
- 2022 美国芯片法案 → 关联：半导体、AI芯片
- 十五五规划"人工智能+" → 关联：具身智能全链
- 工信部人形机器人指导意见（2023）→ 关联：运动控制、感知系统
- 东数西算工程 → 关联：算力基础设施
```

### 5.3 产业数据

```
- 算力网 → 芯片 → 服务器 → 数据中心 → 算力调度
- 人形机器人 → 减速器 → 伺服电机 → 传感器 → 整机
- 生物医药 → 基因编辑 → 药物递送 → 临床试验 → 上市
```

---

## 6. 黑客松开发计划

### Phase 1：骨架搭建（第1天上午）
- [ ] Next.js 项目初始化 + Tailwind 配置
- [ ] 四模块页面路由搭建
- [ ] 数据 JSON 文件编写（具身智能案例）
- [ ] 全局布局 + 侧边栏导航

### Phase 2：模块一核心交互（第1天下午）
- [ ] TechDiagram 组件：SVG 热区 + hover 高亮
- [ ] ExplodeAnimation：Framer Motion 爆炸动画
- [ ] KeywordBubble：关键词气泡浮出
- [ ] TechCard：技术详情卡片（点击展开）

### Phase 3：模块二三（第2天上午）
- [ ] PolicyTimeline：政策时间轴
- [ ] PolicyCard：政策卡片 + 摘要
- [ ] ChainView：产业链视图
- [ ] IndustryBubble：产业关键词气泡

### Phase 4：关联 + 打磨（第2天下午）
- [ ] ConnectionLines：模块间关联线
- [ ] 模块间跳转（点击技术→跳转对应政策）
- [ ] 整体视觉打磨 + 动画过渡
- [ ] 演示脚本准备

---

## 7. 演示脚本（Demo Flow）

```
开场：展示首页，四大模块一览

1. 进入"具身智能"技术介绍
   → hover 机器人手臂 → 爆炸拆解 → 浮出关键词
   → 点击"关节控制" → 展开技术卡片

2. 跳转"政策动向"
   → 时间轴上看到"2023 工信部人形机器人指导意见"
   → 点击 → 展开政策摘要
   → 虚线连线回到技术节点

3. 跳转"产业场景"
   → 看到产业链：减速器 → 伺服电机 → 传感器 → 整机
   → 点击"伺服电机" → 展示它在产业中的位置 + 关联技术

4. 总结：三个轴的技术-政策-产业关联，一目了然
```

---

## 8. 后续扩展（黑客松之后）

- 接入真实政策数据源（政府网站爬虫 / API）
- AI 自动生成技术摘要和政策解读
- 更多技术领域（脑机接口、量子计算、合成生物学...）
- 用户自定义看板（选择关注的技术领域）
- 政策对比功能（中美对比、部委间对比）
- 导出报告功能（一键生成 PDF 研究简报）
