import React, { memo, useRef, useState, useCallback } from "react";
import { useSmartPosition } from "../hooks/useSmartPosition";
import { BoundingRect, TooltipPosition } from "../types";

interface SmartTooltipProps {
  /** 目标元素的位置 */
  targetRect: BoundingRect | null;
  /** Tooltip 内容 */
  content: React.ReactNode;
  /** 是否显示 */
  visible: boolean;
  /** Tooltip 宽度 */
  width?: number;
  /** Tooltip 高度 */
  height?: number;
}

/**
 * 智能 Tooltip 组件
 *
 * 🎯 展示 getBoundingClientRect 的核心价值：
 * - 根据目标元素位置智能选择显示方向
 * - 防止溢出视口边界
 * - 精确像素级定位
 */
export const SmartTooltip = memo<SmartTooltipProps>(
  ({ targetRect, content, visible, width = 280, height = 150 }) => {
    const positionResult = useSmartPosition(targetRect, width, height);

    if (!visible || !positionResult) return null;

    const { position, x, y, arrowOffset } = positionResult;

    return (
      <div
        className="smart-tooltip fixed z-[9999] pointer-events-none"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
        }}
      >
        {/* Tooltip 主体 */}
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl relative">
          {/* 箭头 */}
          <TooltipArrow position={position} offset={arrowOffset} />

          {/* 内容 */}
          {content}
        </div>
      </div>
    );
  }
);

// ============ 箭头组件 ============

interface TooltipArrowProps {
  position: TooltipPosition;
  offset: number;
}

const TooltipArrow: React.FC<TooltipArrowProps> = ({ position, offset }) => {
  const arrowClass = "absolute w-0 h-0";

  const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: {
      bottom: "-8px",
      left: `calc(50% + ${offset}px)`,
      transform: "translateX(-50%)",
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderTop: "8px solid #111827",
    },
    bottom: {
      top: "-8px",
      left: `calc(50% + ${offset}px)`,
      transform: "translateX(-50%)",
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderBottom: "8px solid #111827",
    },
    left: {
      right: "-8px",
      top: `calc(50% + ${offset}px)`,
      transform: "translateY(-50%)",
      borderTop: "8px solid transparent",
      borderBottom: "8px solid transparent",
      borderLeft: "8px solid #111827",
    },
    right: {
      left: "-8px",
      top: `calc(50% + ${offset}px)`,
      transform: "translateY(-50%)",
      borderTop: "8px solid transparent",
      borderBottom: "8px solid transparent",
      borderRight: "8px solid #111827",
    },
  };

  return <div className={arrowClass} style={arrowStyles[position]} />;
};

// ============ Tooltip 内容组件 ============

interface TooltipContentProps {
  rect: BoundingRect;
  cardId: number;
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  rect,
  cardId,
}) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // 计算可用空间
  const spaceAbove = rect.top;
  const spaceBelow = viewport.height - rect.bottom;
  const spaceLeft = rect.left;
  const spaceRight = viewport.width - rect.right;

  return (
    <div className="text-sm">
      <div className="font-bold text-blue-400 mb-2 flex items-center gap-2">
        <i className="fas fa-crosshairs"></i>
        卡片 #{cardId} 定位分析
      </div>

      {/* 位置数据 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 font-mono text-xs">
        <div>
          <span className="text-red-400">top:</span> {Math.round(rect.top)}px
        </div>
        <div>
          <span className="text-blue-400">left:</span> {Math.round(rect.left)}px
        </div>
        <div>
          <span className="text-green-400">bottom:</span>{" "}
          {Math.round(rect.bottom)}px
        </div>
        <div>
          <span className="text-purple-400">right:</span>{" "}
          {Math.round(rect.right)}px
        </div>
      </div>

      {/* 空间分析 */}
      <div className="border-t border-gray-700 pt-2 mt-2">
        <div className="text-xs text-gray-400 mb-1">📐 周围可用空间</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">↑</span> {Math.round(spaceAbove)}
            px
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">↓</span> {Math.round(spaceBelow)}
            px
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">←</span> {Math.round(spaceLeft)}px
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">→</span> {Math.round(spaceRight)}
            px
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-2 text-xs text-gray-500 italic">
        💡 Tooltip 根据空间自动选择最佳方向
      </div>
    </div>
  );
};

// ============ 演示区域组件 ============

interface TooltipDemoCardProps {
  index: number;
}

export const TooltipDemoCard = memo<TooltipDemoCardProps>(({ index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<BoundingRect | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        bottom: r.bottom,
        right: r.right,
        width: r.width,
        height: r.height,
      });
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // 更新位置（滚动时）
  const handleMouseMove = useCallback(() => {
    if (isHovered && cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        bottom: r.bottom,
        right: r.right,
        width: r.width,
        height: r.height,
      });
    }
  }, [isHovered]);

  return (
    <>
      <div
        ref={cardRef}
        className="bg-indigo-50 border-2 border-indigo-300 p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:border-indigo-500"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="flex items-center gap-2">
          <i className="fas fa-magic text-indigo-500"></i>
          <span className="font-bold text-gray-700">悬浮卡片 #{index + 1}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">悬浮查看智能 Tooltip 定位</p>
      </div>

      <SmartTooltip
        targetRect={rect}
        visible={isHovered}
        content={rect && <TooltipContent rect={rect} cardId={index + 1} />}
      />
    </>
  );
});
