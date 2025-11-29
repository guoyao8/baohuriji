# baohuriji（宝护日记）

一个面向育儿家庭的喂养记录与统计应用，支持配方奶、母乳与辅食记录，双胎模式、家庭协作与喂养提醒。基于 React + TypeScript + Vite + Tailwind。

## 快速启动
- 开发：`npm run dev`
- 构建：`npm run build`
- 预览：`npm run preview` → `http://localhost:4173/`

## 部署
- 推荐 Vercel/Netlify，已在仓库提供 `vercel.json`、`netlify.toml`、`Dockerfile`、`nginx.conf`
- 详细指南见 `DEPLOYMENT.md`

## 后端配置
- 使用 Supabase：设置环境变量 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- 或在站点内访问 `/settings/backend` 运行时填写 URL 与 Key

## 产品原型与PRD
- 原型文件位于 `产品原型/`
- 需求文档：`产品原型/PRD_宝护日记_v1.7.md`

## 许可
仅用于演示与学习目的。
