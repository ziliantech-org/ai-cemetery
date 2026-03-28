# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

AI赛博公墓 —— 一个为已停运的AI项目和大语言模型建立的赛博墓园。通过生成讣告、复盘分析和假想的"第二次机会"来保存它们的故事。

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产环境构建
npm start        # 启动生产服务器
npm run lint     # 运行 ESLint 检查
```

## 技术栈

- **框架**: Next.js 14 (App Router) + React 18 + TypeScript 5
- **样式**: Tailwind CSS 3，自定义主题色（`cemetery-*` 系列）和动画定义在 `tailwind.config.ts`
- **动画**: Framer Motion（墓碑悬浮、淡入淡出、粒子效果等）
- **国际化**: next-intl，支持 `en` / `zh` 两种语言，默认英文
- **后端**: Next.js API Routes + SQLite（better-sqlite3），数据库文件自动创建于 `data/cemetery.db`
- **路径别名**: `@/*` → `./src/*`

## 架构要点

### 路由与国际化

使用 Next.js App Router + next-intl 的动态路由方案。所有页面在 `src/app/[locale]/` 下，通过 `src/middleware.ts` 处理 locale 路由匹配（`/en/`、`/zh/`）。国际化路由配置在 `src/i18n/routing.ts`，其中导出的 `Link`、`useRouter` 等应替代 Next.js 原生导航组件使用。

### 组件结构

- `src/components/Cemetery/` — 墓园场景核心：`CemeteryScene`（主场景横向滚动）、`Tombstone`（单个墓碑）、`FogEffect`（雾气层）、`MoonLight`（月光效果）
- `src/components/Interactions/` — 用户交互：点蜡烛、献花、按F致敬、写悼词、分享
- `src/components/Modal/ModelDetail.tsx` — AI模型详情弹窗
- `src/components/Timeline/` — 时间线视图

### 后端 API

三组 API 路由（`src/app/api/`），数据库操作封装在 `src/lib/db.ts`：

- `GET/POST /api/counters` — 获取/递增模型计数器（candles、flowers、respects）
- `GET/POST /api/visitors` — 获取/递增全局访客数
- `GET/POST /api/eulogies` — 获取/提交悼词

前端通过 `src/lib/firebase.ts`（API 客户端）调用这些接口，导出函数签名与组件调用方式不变。

### 数据层

- `src/data/models.ts` — AI模型数据定义和 `AIModel` 类型接口，每个模型包含中英文双语字段（`name`/`nameZh`、`epitaph`/`epitaphZh` 等）
- `src/lib/db.ts` — SQLite 数据库初始化和操作函数（counters、visitors、eulogies 三张表）

### 响应式设计

桌面端为横向滚动墓园场景，移动端为纵向网格布局，通过视口尺寸条件渲染不同布局。

## 数据存储

无需任何外部服务配置。SQLite 数据库文件 `data/cemetery.db` 在首次 API 请求时自动创建（已加入 `.gitignore`）。

## 编码约定

- 交互组件使用 `'use client'` 标记
- Tailwind 优先，复杂动画关键帧写在 `globals.css`
- 颜色使用 `tailwind.config.ts` 中定义的 `cemetery-*` 主题 token
- 新增 AI 模型数据时需同时提供中英文字段
