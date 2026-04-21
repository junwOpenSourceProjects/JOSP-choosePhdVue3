# 🎓 JOSP-choosePhdVue3 - 大学排名查询系统前端

![Vue](https://img.shields.io/badge/Vue-3.5.32-brightgreen?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-8.0.9-blue?logo=vite)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13.6-blue?logo=element)
![ECharts](https://img.shields.io/badge/ECharts-6.0.0-orange?logo=apacheecharts)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue)

## 📖 项目简介

JOSP-choosePhdVue3 是一个基于 Vue3 + Element Plus 构建的大学排名查询系统前端应用，提供世界大学排名数据的可视化查询和展示功能。支持 QS、US News 等排名数据的多维度筛选和图表展示。

**关联后端项目**: [JOSP-choosePhdJava](https://github.com/junwOpenSourceProjects/JOSP-choosePhdJava)

## 🏗️ 技术架构

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.32 | 前端框架 |
| Vite | 8.0.9 | 构建工具 |
| Element Plus | 2.13.6 | UI 组件库 |
| ECharts | 6.0.0 | 数据可视化 |
| vue-echarts | 8.0.1 | ECharts Vue 封装 |
| Pinia | 3.0.4 | 状态管理 |
| Vue Router | 5.0.4 | 路由管理 |

## 📁 项目结构

```
src/
├── App.vue              # 根组件
├── main.js              # 入口文件
├── assets/              # 静态资源
├── components/          # 公共组件
│   └── icons/           # 图标组件
├── views/               # 页面组件
│   ├── Home.vue         # 首页
│   ├── Page1.vue        # 院校列表
│   ├── Page2.vue        # 院校详情
│   ├── Page3.vue        # 专业分析
│   ├── Page4.vue        # 数据可视化
│   └── DemoContainer.vue
├── router/              # 路由配置
├── stores/              # 状态管理
└── utils/               # 工具函数
```

## 🚀 快速开始

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

访问 http://localhost:5173

### 生产构建

```sh
npm run build
```

### 其他命令

| 命令 | 说明 |
|------|------|
| `npm run preview` | 预览生产版本 |
| `npm run test:unit` | 运行单元测试 |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 🔌 后端集成

项目配置了 API 代理，开发环境下：

- 前端请求 `/api/*` 会代理到 `http://localhost:8081`
- 后端项目：[JOSP-choosePhdJava](https://github.com/junwOpenSourceProjects/JOSP-choosePhdJava)

## 🛠️ 开发工具推荐

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用 Vetur)

## 📋 更多信息

- [SPEC.md](./SPEC.md) - 详细技术规格
- [Vite 配置参考](https://vite.dev/config/)
- [Vitest 测试框架](https://vitest.dev/)
- [ESLint 代码检查](https://eslint.org/)