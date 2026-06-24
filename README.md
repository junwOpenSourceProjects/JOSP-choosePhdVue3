# choosePhd Web

choosePhd 前端项目 —— 院校选择与博士/硕士项目对比平台。

## 技术栈

- **Nuxt 4**（Nitro + Vite）
- **Vue 3** + **TypeScript**
- **@nuxt/ui v4** + **Tailwind CSS v4**
- **Pinia** 状态管理
- **ECharts 6** + **vue-echarts** 图表

## 环境要求

- Node.js >= 20
- **pnpm** >= 10（项目使用 `pnpm-lock.yaml`，请勿用 `npm`）

## 安装与启动

```bash
# 1. 安装依赖（必须用 pnpm）
pnpm install

# 2. 开发环境启动
pnpm dev
```

默认端口 `3000`，后端 API 默认指向 `http://localhost:56586`，可通过环境变量覆盖：

```bash
NUXT_PUBLIC_API_BASE=http://localhost:8080 pnpm dev
```

## 构建

```bash
# 生产构建
pnpm build

# 本地预览生产构建
pnpm preview
```

## 常见问题

### 1. 启动时报 `Can't resolve 'tailwindcss' in './app/assets/css'`

本项目使用 Tailwind CSS v4，CSS 中通过 `@import "tailwindcss"` 引入。pnpm 默认严格隔离依赖，必须把 `tailwindcss` 提到顶层 `node_modules` 才能被 Vite 解析。

**解决方式**：
- 不要删除仓库根目录的 `.npmrc`
- 使用 `pnpm install` 安装，不要用 `npm install`
- 若之前用 npm 装过，先清掉再重装：
  ```bash
  rm -rf node_modules .nuxt
  pnpm install
  pnpm dev
  ```

### 2. 启动时大量字体/图标抓取警告或报错

报错示例：

```
Could not fetch from https://api.fontsource.org/v1/fonts
Could not fetch from https://api.fontshare.com/v2/fonts
Could not initialize provider googleicons
```

**原因**：`@nuxt/ui v4` 默认集成 `@nuxt/fonts`，启动时会联网从 fontsource、fontshare、googleicons 等来源拉取字体元数据。在国内或网络受限环境下会失败。

**解决方式**：已在 `nuxt.config.ts` 中设置 `ui.fonts: false` 禁用自动字体模块。页面使用的 DM Sans 字体通过 `app.head.link` 手动引入，浏览器在可联网时正常加载；无网络时仅字体显示回退到系统默认字体，不影响功能。

### 3. `Ignored build scripts` 警告

安装依赖时可能出现：

```
Ignored build scripts: @parcel/watcher@..., esbuild@..., vue-demi@...
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

这是 pnpm v10+ 的安全策略，默认禁止依赖执行 postinstall 等脚本。若后续遇到原生模块（如 esbuild）未正确构建，可执行：

```bash
pnpm approve-builds
```

按提示允许 `@parcel/watcher`、`esbuild`、`vue-demi` 等包运行构建脚本。

## 相关仓库

- 后端 API：[JOSP-choosePhdJava](https://github.com/junwOpenSourceProjects/JOSP-choosePhdJava)
