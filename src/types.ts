export interface Card {
  /** 唯一标识，也用于 React key */
  id: number;
  /** 卡片主标题 */
  title: string;
  /** 副标题或简述文字 */
  description: string;
  /** 图标类名或 SVG 字符串 */
  icon: string;
  /** 背景色类名或渐变值 */
  bg: string;
  /** 边框色类名 */
  border: string;
  /** 右上角标签色类名 */
  badge: string;
}

export interface BoundingRect {
  /** 元素上边界到视口顶部距离（px） */
  top: number;
  /** 元素左边界到视口左侧距离（px） */
  left: number;
  /** 元素下边界到视口顶部距离（px） */
  bottom: number;
  /** 元素右边界到视口左侧距离（px） */
  right: number;
  /** 元素宽度（px） */
  width: number;
  /** 元素高度（px） */
  height: number;
}

export interface ElementPosition {
  /** 元素在视口内的绝对像素几何 */
  rect: BoundingRect;
  /** 任意部分是否可见 */
  isInViewport: boolean;
  /** 整体是否完全可见 */
  isFullyVisible: boolean;
  /** 人类可读的状态描述（含 emoji） */
  status: string;
}

export interface ViewportInfo {
  /** 视口宽度（px） */
  width: number;
  /** 视口高度（px） */
  height: number;
  /** 垂直滚动距离（px） */
  scrollY: number;
}

// ============ 性能实验室类型 ============

/** 性能优化设置 */
export interface PerformanceSettings {
  /** 是否启用节流（关闭后每像素都计算） */
  enableThrottle: boolean;
  /** 是否启用 passive 事件监听 */
  enablePassive: boolean;
  /** 是否启用 Layout Thrashing（恶意重排） */
  enableLayoutThrashing: boolean;
  /** 节流间隔（毫秒） */
  throttleInterval: number;
}

/** 性能指标数据 */
export interface PerformanceMetrics {
  /** 当前 FPS */
  fps: number;
  /** 滚动事件触发次数（每秒） */
  scrollEventsPerSecond: number;
  /** 主线程阻塞时间（毫秒） */
  mainThreadBlockTime: number;
  /** getBoundingClientRect 调用次数（每秒） */
  rectCallsPerSecond: number;
  /** IntersectionObserver 回调次数（每秒） */
  ioCallbacksPerSecond: number;
}

/** 检测方案类型 */
export type DetectionMethod = "getBoundingClientRect" | "IntersectionObserver";

/** 对比卡片状态 */
export interface ComparisonCardState {
  id: number;
  isVisible: boolean;
  method: DetectionMethod;
}

/** Tooltip 位置方向 */
export type TooltipPosition = "top" | "bottom" | "left" | "right";

/** 智能定位结果 */
export interface SmartPositionResult {
  /** 最佳显示方向 */
  position: TooltipPosition;
  /** 实际 X 坐标 */
  x: number;
  /** 实际 Y 坐标 */
  y: number;
  /** 箭头偏移量 */
  arrowOffset: number;
}
