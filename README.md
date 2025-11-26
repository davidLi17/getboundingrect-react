# getBoundingClientRect() React 可视化演示

这是一个使用 React 18、TypeScript 和 TailwindCSS 构建的 `getBoundingClientRect()` API 可视化演示工具。该项目将原始的 HTML 版本重构为现代化的 React 应用，包含了性能优化和状态管理。

## 🚀 技术栈

- **React 18** - 使用最新的 React 特性
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **TailwindCSS** - 实用优先的 CSS 框架
- **Lodash** - 性能优化的工具库
- **Font Awesome** - 图标库

## ✨ 功能特性

- 🎯 **实时位置追踪** - 使用 `getBoundingClientRect()` API 实时追踪元素位置
- 🎨 **可视化边界** - 鼠标悬浮时显示元素边界和尺寸信息
- 📊 **状态仪表盘** - 显示视口信息、可见元素数量和滚动距离
- 🔄 **性能优化** - 使用 React.memo、useCallback 和 Lodash 节流优化
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🎭 **动画效果** - 平滑的过渡动画

## 🏗️ 项目结构

```
src/
├── components/          # React 组件
│   ├── Card.tsx        # 卡片组件
│   └── VisualOverlay.tsx # 可视化覆盖层
├── context/            # React Context
│   └── CardContext.tsx # 卡片状态管理
├── hooks/              # 自定义 Hooks
│   └── useElementPosition.ts # 元素位置追踪
├── types/              # TypeScript 类型定义
│   └── index.ts        # 类型接口
├── utils/              # 工具函数
│   └── cardGenerator.ts # 卡片数据生成
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 🎮 使用说明

1. **鼠标悬浮** - 将鼠标悬浮在卡片上查看可视化边界和位置参数
2. **点击卡片** - 点击卡片在控制台查看详细的位置信息
3. **滚动页面** - 观察仪表盘中可见元素数量的变化
4. **查看FPS** - 顶部显示实时FPS监控

## 🛠️ 安装和运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🔧 核心技术实现

### useElementPosition Hook
```typescript
const position = useElementPosition(elementRef);
```
这个 Hook 封装了 `getBoundingClientRect()` 的调用，并提供了：
- 实时位置更新
- 视口可见性检测
- 滚动和 resize 事件监听
- 使用 Lodash throttle 进行性能优化

### 状态管理
使用 React Context 进行全局状态管理：
- 卡片可见性状态
- 悬停状态
- 统一的更新机制

### 性能优化
- **React.memo** - 避免不必要的组件重渲染
- **useCallback** - 稳定的函数引用
- **useMemo** - 缓存计算结果
- **Lodash throttle** - 限制高频事件触发

## 📚 关于 getBoundingClientRect()

`getBoundingClientRect()` 方法返回元素的大小及其相对于视口的位置。

返回的 DOMRect 对象包含：
- `top` - 元素顶部到视口顶部的距离
- `left` - 元素左边到视口左边的距离
- `bottom` - 元素底部到视口顶部的距离
- `right` - 元素右边到视口左边的距离
- `width` - 元素宽度
- `height` - 元素高度

## 🎯 学习要点

1. **坐标系理解** - 理解相对视口的坐标系统
2. **事件监听** - 滚动和 resize 事件的处理
3. **性能优化** - 防抖和节流的应用
4. **状态管理** - React Context 的使用
5. **组件设计** - 组件拆分和复用

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

## 📄 许可证

MIT License
