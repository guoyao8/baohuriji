# 部署指南

## 本地构建与预览
- 构建: `npm run build`
- 预览: `npm run preview` 访问 `http://localhost:4173/`

## Vercel 部署
- 推送代码到Git仓库并在Vercel导入项目
- 自动识别配置文件 `vercel.json`
- Build Command: `npm run build`
- Output Directory: `dist`
- 设置环境变量 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`

## Netlify 部署
- 使用 `netlify.toml`
- Build Command: `npm run build`
- Publish Directory: `dist`
- 设置环境变量 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`

## Docker 部署
- 构建镜像: `docker build -t baby-journal .`
- 运行容器: `docker run -p 8080:80 baby-journal`
- 访问 `http://localhost:8080/`

## 运行时后端配置
- 应用内路径 `/settings/backend` 可设置 Supabase URL 与 Anon Key
- 或在服务器环境中设置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`
