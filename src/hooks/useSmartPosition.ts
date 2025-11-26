import { useMemo, useCallback } from "react";
import { BoundingRect, TooltipPosition, SmartPositionResult } from "../types";

// ============================================================
// 📐 常量配置
// ============================================================

const DEFAULT_GAP = 8;
const VIEWPORT_PADDING = 8;
const ARROW_PADDING = 20;

// ============================================================
// 🎯 策略模式（函数式实现）
// ============================================================

/** 定位策略的输入参数 */
interface PositionInput {
  targetRect: BoundingRect;
  tooltipWidth: number;
  tooltipHeight: number;
  gap: number;
  viewport: { width: number; height: number };
}

/** 定位策略的输出结果 */
interface PositionOutput {
  position: TooltipPosition;
  x: number;
  y: number;
}

/** 定位策略函数类型 */
type PositionStrategy = (input: PositionInput) => PositionOutput | null;

// ---------- 具体策略实现 ----------

/**
 * 策略：优先下方显示
 */
const bottomFirstStrategy: PositionStrategy = ({
  targetRect,
  tooltipWidth,
  tooltipHeight,
  gap,
  viewport,
}) => {
  const spaceBelow = viewport.height - targetRect.bottom;
  if (spaceBelow >= tooltipHeight + gap) {
    return {
      position: "bottom",
      x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.bottom + gap,
    };
  }
  return null;
};

/**
 * 策略：优先上方显示
 */
const topFirstStrategy: PositionStrategy = ({
  targetRect,
  tooltipWidth,
  tooltipHeight,
  gap,
}) => {
  const spaceAbove = targetRect.top;
  if (spaceAbove >= tooltipHeight + gap) {
    return {
      position: "top",
      x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.top - tooltipHeight - gap,
    };
  }
  return null;
};

/**
 * 策略：优先右侧显示
 */
const rightFirstStrategy: PositionStrategy = ({
  targetRect,
  tooltipWidth,
  tooltipHeight,
  gap,
  viewport,
}) => {
  const spaceRight = viewport.width - targetRect.right;
  if (spaceRight >= tooltipWidth + gap) {
    return {
      position: "right",
      x: targetRect.right + gap,
      y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
    };
  }
  return null;
};

/**
 * 策略：优先左侧显示
 */
const leftFirstStrategy: PositionStrategy = ({
  targetRect,
  tooltipWidth,
  tooltipHeight,
  gap,
}) => {
  const spaceLeft = targetRect.left;
  if (spaceLeft >= tooltipWidth + gap) {
    return {
      position: "left",
      x: targetRect.left - tooltipWidth - gap,
      y: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
    };
  }
  return null;
};

/**
 * 策略：跟随鼠标（需要鼠标坐标）
 */
const followMouseStrategy =
  (mouseX: number, mouseY: number): PositionStrategy =>
  ({ gap }) => ({
    position: "bottom",
    x: mouseX + gap,
    y: mouseY + gap,
  });

/**
 * 策略：固定位置
 */
const fixedPositionStrategy =
  (
    fixedX: number,
    fixedY: number,
    fixedPosition: TooltipPosition
  ): PositionStrategy =>
  () => ({
    position: fixedPosition,
    x: fixedX,
    y: fixedY,
  });

// ---------- 预设策略组合 ----------

/** 默认策略顺序：下 > 上 > 右 > 左 */
const defaultStrategies: PositionStrategy[] = [
  bottomFirstStrategy,
  topFirstStrategy,
  rightFirstStrategy,
  leftFirstStrategy,
];

/** 上优先策略顺序：上 > 下 > 左 > 右 */
const topPreferredStrategies: PositionStrategy[] = [
  topFirstStrategy,
  bottomFirstStrategy,
  leftFirstStrategy,
  rightFirstStrategy,
];

/** 水平优先策略顺序：右 > 左 > 下 > 上 */
const horizontalStrategies: PositionStrategy[] = [
  rightFirstStrategy,
  leftFirstStrategy,
  bottomFirstStrategy,
  topFirstStrategy,
];

// ============================================================
// 🔗 责任链模式（函数式实现）
// ============================================================

/** 处理器函数类型 */
type PositionHandler = (
  result: PositionOutput,
  context: PositionInput
) => PositionOutput;

/**
 * 处理器：视口边界约束
 * 确保 Tooltip 不会超出视口
 */
const viewportBoundaryHandler: PositionHandler = (
  result,
  { tooltipWidth, tooltipHeight, viewport }
) => {
  let { x, y } = result;

  // 水平边界
  if (x < VIEWPORT_PADDING) {
    x = VIEWPORT_PADDING;
  } else if (x + tooltipWidth > viewport.width - VIEWPORT_PADDING) {
    x = viewport.width - tooltipWidth - VIEWPORT_PADDING;
  }

  // 垂直边界
  if (y < VIEWPORT_PADDING) {
    y = VIEWPORT_PADDING;
  } else if (y + tooltipHeight > viewport.height - VIEWPORT_PADDING) {
    y = viewport.height - tooltipHeight - VIEWPORT_PADDING;
  }

  return { ...result, x, y };
};

/**
 * 处理器：滚动容器约束（示例）
 * 可扩展为检测父级滚动容器的边界
 */
const scrollContainerHandler: PositionHandler = (result) => {
  // 未来可以在这里添加滚动容器边界检测逻辑
  // 例如：检测最近的 overflow: auto/scroll 祖先元素
  return result;
};

/**
 * 处理器：安全区域约束（移动端）
 * 避免被刘海、底部手势区域遮挡
 */
const safeAreaHandler: PositionHandler = (
  result,
  { tooltipHeight, viewport }
) => {
  // 简单示例：避开顶部 50px（状态栏等）
  const safeTop = 50;
  const safeBottom = 34; // iPhone 底部安全区

  let { y } = result;

  if (y < safeTop) {
    y = safeTop;
  } else if (y + tooltipHeight > viewport.height - safeBottom) {
    y = viewport.height - tooltipHeight - safeBottom;
  }

  return { ...result, y };
};

// ---------- 处理器管线组合 ----------

/** 默认处理管线 */
const defaultHandlers: PositionHandler[] = [viewportBoundaryHandler];

/** 移动端处理管线 */
const mobileHandlers: PositionHandler[] = [
  viewportBoundaryHandler,
  safeAreaHandler,
];

/** 完整处理管线 */
const fullHandlers: PositionHandler[] = [
  viewportBoundaryHandler,
  scrollContainerHandler,
  safeAreaHandler,
];

// ============================================================
// 🧮 箭头偏移计算
// ============================================================

/**
 * 计算箭头偏移量
 */
const calculateArrowOffset = (
  result: PositionOutput,
  targetRect: BoundingRect,
  tooltipWidth: number,
  tooltipHeight: number
): number => {
  const { position, x, y } = result;
  let arrowOffset = 0;

  if (position === "top" || position === "bottom") {
    const centerX = targetRect.left + targetRect.width / 2;
    arrowOffset = centerX - x - tooltipWidth / 2;
    arrowOffset = Math.max(
      -tooltipWidth / 2 + ARROW_PADDING,
      Math.min(tooltipWidth / 2 - ARROW_PADDING, arrowOffset)
    );
  } else {
    const centerY = targetRect.top + targetRect.height / 2;
    arrowOffset = centerY - y - tooltipHeight / 2;
    arrowOffset = Math.max(
      -tooltipHeight / 2 + ARROW_PADDING,
      Math.min(tooltipHeight / 2 - ARROW_PADDING, arrowOffset)
    );
  }

  return arrowOffset;
};

// ============================================================
// 🔧 核心计算引擎
// ============================================================

interface SmartPositionOptions {
  /** 定位策略列表（按优先级排序） */
  strategies?: PositionStrategy[];
  /** 后处理管线 */
  handlers?: PositionHandler[];
}

/**
 * 核心位置计算函数
 *
 * @param targetRect - 目标元素位置
 * @param tooltipWidth - Tooltip 宽度
 * @param tooltipHeight - Tooltip 高度
 * @param gap - 间距
 * @param options - 可选配置（策略、处理器）
 */
export const calculateSmartPosition = (
  targetRect: BoundingRect,
  tooltipWidth: number,
  tooltipHeight: number,
  gap: number = DEFAULT_GAP,
  options: SmartPositionOptions = {}
): SmartPositionResult => {
  const { strategies = defaultStrategies, handlers = defaultHandlers } =
    options;

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const input: PositionInput = {
    targetRect,
    tooltipWidth,
    tooltipHeight,
    gap,
    viewport,
  };

  // 1️⃣ 策略模式：依次尝试各策略，找到第一个可行的
  let result: PositionOutput | null = null;
  for (const strategy of strategies) {
    result = strategy(input);
    if (result) break;
  }

  // 如果所有策略都失败，使用默认位置（下方）
  if (!result) {
    result = {
      position: "bottom",
      x: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      y: targetRect.bottom + gap,
    };
  }

  // 2️⃣ 责任链模式：依次执行处理器
  for (const handler of handlers) {
    result = handler(result, input);
  }

  // 3️⃣ 计算箭头偏移
  const arrowOffset = calculateArrowOffset(
    result,
    targetRect,
    tooltipWidth,
    tooltipHeight
  );

  return {
    position: result.position,
    x: result.x,
    y: result.y,
    arrowOffset,
  };
};

// ============================================================
// 🎣 React Hooks（向后兼容）
// ============================================================

/**
 * 智能定位 Hook（原有接口，向后兼容）
 *
 * @param targetRect - 目标元素的位置信息
 * @param tooltipWidth - Tooltip 宽度
 * @param tooltipHeight - Tooltip 高度
 * @param gap - Tooltip 与目标元素的间距
 */
export const useSmartPosition = (
  targetRect: BoundingRect | null,
  tooltipWidth: number = 200,
  tooltipHeight: number = 100,
  gap: number = DEFAULT_GAP
): SmartPositionResult | null => {
  return useMemo(() => {
    if (!targetRect) return null;
    return calculateSmartPosition(targetRect, tooltipWidth, tooltipHeight, gap);
  }, [targetRect, tooltipWidth, tooltipHeight, gap]);
};

/**
 * 高级智能定位 Hook（支持自定义策略和处理器）
 */
export const useAdvancedSmartPosition = (
  targetRect: BoundingRect | null,
  tooltipWidth: number = 200,
  tooltipHeight: number = 100,
  gap: number = DEFAULT_GAP,
  options: SmartPositionOptions = {}
): SmartPositionResult | null => {
  return useMemo(() => {
    if (!targetRect) return null;
    return calculateSmartPosition(
      targetRect,
      tooltipWidth,
      tooltipHeight,
      gap,
      options
    );
  }, [targetRect, tooltipWidth, tooltipHeight, gap, options]);
};

// ============================================================
// 📦 导出策略和处理器（供外部自定义组合）
// ============================================================

export const positionStrategies = {
  bottomFirst: bottomFirstStrategy,
  topFirst: topFirstStrategy,
  rightFirst: rightFirstStrategy,
  leftFirst: leftFirstStrategy,
  followMouse: followMouseStrategy,
  fixed: fixedPositionStrategy,
  // 预设组合
  presets: {
    default: defaultStrategies,
    topPreferred: topPreferredStrategies,
    horizontal: horizontalStrategies,
  },
};

export const positionHandlers = {
  viewportBoundary: viewportBoundaryHandler,
  scrollContainer: scrollContainerHandler,
  safeArea: safeAreaHandler,
  // 预设组合
  presets: {
    default: defaultHandlers,
    mobile: mobileHandlers,
    full: fullHandlers,
  },
};

// ============================================================
// 🛠️ 工具函数（保持原有导出）
// ============================================================

/**
 * 计算两个元素是否重叠（碰撞检测）
 */
export const useCollisionDetection = () => {
  const checkCollision = useCallback(
    (rect1: BoundingRect, rect2: BoundingRect): boolean => {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    },
    []
  );

  const getOverlapArea = useCallback(
    (rect1: BoundingRect, rect2: BoundingRect): number => {
      const xOverlap = Math.max(
        0,
        Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)
      );
      const yOverlap = Math.max(
        0,
        Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)
      );
      return xOverlap * yOverlap;
    },
    []
  );

  return { checkCollision, getOverlapArea };
};

/**
 * 计算元素相对于另一个元素的位置
 */
export const getRelativePosition = (
  childRect: BoundingRect,
  parentRect: BoundingRect
) => {
  return {
    top: childRect.top - parentRect.top,
    left: childRect.left - parentRect.left,
    bottom: parentRect.bottom - childRect.bottom,
    right: parentRect.right - childRect.right,
  };
};

/**
 * 计算元素中心点
 */
export const getCenter = (rect: BoundingRect) => {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

/**
 * 计算两个元素中心点之间的距离
 */
export const getDistance = (rect1: BoundingRect, rect2: BoundingRect) => {
  const center1 = getCenter(rect1);
  const center2 = getCenter(rect2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};
