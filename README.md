# chooseCollegeVue

Vue3博士选择系统前端应用

## 系统架构

```mermaid
graph TB
    subgraph Frontend["前端应用"]
        App[App.vue<br/>应用入口]
        Router[Vue Router<br/>路由管理]
        Store[Pinia Store<br/>状态管理]
        
        subgraph Views["视图层"]
            CollegeList[院校列表]
            CollegeDetail[院校详情]
            MajorAnalysis[专业分析]
            DataVisualization[数据可视化]
        end
        
        subgraph Components["组件层"]
            Charts[ECharts图表组件]
            Forms[表单组件]
            Tables[表格组件]
        end
        
        subgraph Core["核心功能"]
            API[API请求模块]
            Assets[静态资源]
        end
    end
    
    subgraph UI["UI框架"]
        ElementPlus[Element Plus]
        VueEcharts[Vue-ECharts]
    end
    
    subgraph Backend["后端服务"]
        JavaAPI[Java后端API]
    end
    
    App --> Router
    App --> Store
    Router --> Views
    Views --> Components
    Views --> API
    Store --> API
    Components --> ElementPlus
    Components --> VueEcharts
    Views --> VueEcharts
    API --> JavaAPI
    
    classDef frontendStyle fill:#42b983,stroke:#35495e,color:#fff
    classDef uiStyle fill:#409eff,stroke:#35495e,color:#fff
    classDef backendStyle fill:#f56c6c,stroke:#35495e,color:#fff
    
    class App,Router,Store frontendStyle
    class ElementPlus,VueEcharts uiStyle
    class JavaAPI backendStyle
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
