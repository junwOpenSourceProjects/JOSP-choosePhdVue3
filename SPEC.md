# JOSP-choosePhdVue3 Specification

## 1. Project Overview

- **Project Name**: JOSP-choosePhdVue3
- **Project Type**: Vue3 Frontend Application
- **Core Functionality**: A university ranking query system providing visualization and filtering of world university rankings (QS, US News, etc.)
- **Target Users**: Students, researchers, and academic professionals seeking university ranking information

## 2. Technical Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Vue.js | ^3.5.32 |
| Build Tool | Vite | ^8.0.9 |
| UI Library | Element Plus | ^2.13.6 |
| Charts | ECharts / vue-echarts | ^6.0.0 / ^8.0.1 |
| State Management | Pinia | ^3.0.4 |
| Router | Vue Router | ^5.0.4 |
| Language | JavaScript (ES modules) | - |

## 3. Project Structure

```
src/
├── App.vue              # Root application component
├── main.js              # Application entry point
├── assets/              # Static assets (logos, styles)
├── components/          # Reusable Vue components
│   └── icons/           # Icon components
├── views/               # Page components
│   ├── Home.vue         # Home page
│   ├── DemoContainer.vue
│   ├── Page1.vue        # University ranking list
│   ├── Page2.vue        # Ranking details
│   ├── Page3.vue        # Major analysis
│   └── Page4.vue        # Data visualization
├── router/              # Vue Router configuration
├── stores/              # Pinia state stores
└── utils/               # Utility functions
```

## 4. Functionality Specification

### 4.1 Core Features
- [x] University ranking list display (Page1)
- [x] University detail view (Page2)
- [x] Major/specialty analysis (Page3)
- [x] Data visualization with ECharts (Page4)
- [x] Multi-dimensional filtering (ranking type, country, subject)
- [x] Responsive chart components

### 4.2 User Interactions
- Ranking data filtering and sorting
- Interactive charts (zoom, hover tooltips)
- Navigation between different ranking views
- API proxy to backend for data fetching

### 4.3 API Integration
- Backend proxy configured at `/api` → `http://localhost:8081`
- Axios for HTTP requests
- CORS support via Vite dev server

## 5. Configuration

### Vite Configuration
- **Dev Server Port**: 5173
- **API Proxy**: `/api` → `http://localhost:8081`
- **Plugins**: Vue, Vue JSX, Element Plus

### Build Configuration
- **Output**: `dist/` directory
- **Target**: ES2020+

## 6. Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run lint` | Lint code (ESLint) |
| `npm run format` | Format code (Prettier) |

## 7. Backend Integration

- **Backend Project**: JOSP-choosePhdJava
- **API Base**: `http://localhost:8081`
- **Proxy Path**: `/api/*` → backend paths

## 8. Browser Support

- Chrome/Edge 89+
- Firefox 88+
- Safari 14+

## 9. Build Status

- ✅ Vite 8.0.9 installed
- ✅ Vue 3.5.32 installed
- ✅ Production build verified