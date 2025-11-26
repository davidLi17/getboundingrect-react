# 性能实验室 (Performance Lab) 任务计划

## 📋 项目概述

将 getBoundingClientRect 演示工具升级为"浏览器渲染原理实验台"，展示：

1. 滥用 API 导致的卡顿 vs 正确使用的流畅
2. getBoundingClientRect vs IntersectionObserver 性能对比
3. 坐标计算的不可替代价值（智能 Tooltip 定位）

## 🎯 核心功能

### 模块一：劣化模式 (The "Lag" Switch)

- [ ] 控制面板开关：开启/关闭 throttle
- [ ] 控制面板开关：开启/关闭 passive: true
- [ ] 控制面板开关：开启 Layout Thrashing（强制重排）
- [ ] 实时显示 FPS 下跌情况

### 模块二：API 对比视图

- [ ] 左侧：scroll + getBoundingClientRect 方案
- [ ] 右侧：IntersectionObserver 方案
- [ ] 显示主线程阻塞时间
- [ ] 显示事件触发频率

### 模块三：智能 Tooltip 定位

- [ ] 防溢出检测
- [ ] 智能方向判断（上/下/左/右）
- [ ] 展示 top/left/right/bottom 的计算价值

## 📁 文件结构

```
src/
├── types.ts                          # 新增类型
├── context/
│   ├── CardContext.tsx               # 已有
│   └── PerformanceContext.tsx        # 新增
├── hooks/
│   ├── useElementPosition.ts         # 改造
│   ├── usePerformanceMetrics.ts      # 新增
│   ├── useIntersectionObserver.ts    # 新增
│   └── useSmartPosition.ts           # 新增
├── components/
│   ├── Card.tsx                      # 已有
│   ├── VisualOverlay.tsx             # 已有
│   ├── PerformancePanel.tsx          # 新增
│   ├── ComparisonView.tsx            # 新增
│   └── SmartTooltip.tsx              # 新增
└── App.tsx                           # 改造
```

## 🔧 技术要点

### Layout Thrashing 示例代码

```typescript
// 恶意操作：强制浏览器反复重排
for (let i = 0; i < 100; i++) {
  const width = element.offsetWidth; // 强制 layout 读取
  element.style.width = width + 1 + "px"; // 触发 layout 写入
}
```

### IntersectionObserver 优势

- 异步执行，不阻塞主线程
- 浏览器原生优化
- 适合可见性检测场景

### getBoundingClientRect 不可替代场景

- 精确像素级定位
- 动态 Tooltip/Popover 定位
- 拖拽功能
- 碰撞检测
