import React, { memo, useRef } from "react";
import { useElementPosition } from "../hooks/useElementPosition";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { usePerformanceContext } from "../context/PerformanceContext";

/**
 * 对比视图：左右并列展示两种方案的效果
 *
 * 左侧：scroll + getBoundingClientRect
 * 右侧：IntersectionObserver
 */
export const ComparisonView = memo(() => {
  return (
    <div className="comparison-view">
      {/* 说明卡片 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mb-6">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <i className="fas fa-balance-scale text-purple-600"></i>
          方案对比：Old School vs New School
        </h3>
        <p className="text-sm text-gray-600">
          滚动页面，观察两种方案在检测元素可见性时的差异。 左侧使用传统的 scroll
          + getBoundingClientRect， 右侧使用现代的 IntersectionObserver。
        </p>
      </div>

      {/* 对比网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：getBoundingClientRect 方案 */}
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
            <h4 className="font-bold text-red-700 flex items-center gap-2">
              <i className="fas fa-scroll"></i>
              scroll + getBoundingClientRect
            </h4>
            <p className="text-xs text-red-600 mt-1">
              同步执行 • 可能阻塞主线程 • 精确像素级定位
            </p>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <BoundingRectCard key={`rect-${i}`} index={i} />
          ))}
        </div>

        {/* 右侧：IntersectionObserver 方案 */}
        <div className="space-y-4">
          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
            <h4 className="font-bold text-green-700 flex items-center gap-2">
              <i className="fas fa-eye"></i>
              IntersectionObserver
            </h4>
            <p className="text-xs text-green-600 mt-1">
              异步执行 • 浏览器优化 • 只能判断可见性
            </p>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <IntersectionCard key={`io-${i}`} index={i} />
          ))}
        </div>
      </div>

      {/* 对比总结 */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-3">📝 技术对比</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-red-600 mb-2">
              getBoundingClientRect 适用场景
            </h5>
            <ul className="space-y-1 text-gray-600">
              <li>✅ 拖拽功能（需要精确坐标）</li>
              <li>✅ Tooltip/Popover 定位</li>
              <li>✅ 碰撞检测</li>
              <li>✅ 画布/Canvas 操作</li>
              <li>❌ 大量元素可见性检测</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-green-600 mb-2">
              IntersectionObserver 适用场景
            </h5>
            <ul className="space-y-1 text-gray-600">
              <li>✅ 图片懒加载</li>
              <li>✅ 无限滚动</li>
              <li>✅ 广告曝光统计</li>
              <li>✅ 动画触发</li>
              <li>❌ 精确像素级定位</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============ 子组件 ============

interface CardProps {
  index: number;
}

/**
 * 使用 getBoundingClientRect 的卡片
 */
const BoundingRectCard: React.FC<CardProps> = memo(({ index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { settings, incrementRectCalls } = usePerformanceContext();

  const position = useElementPosition(
    ref,
    {
      enableThrottle: settings.enableThrottle,
      enablePassive: settings.enablePassive,
      enableLayoutThrashing: settings.enableLayoutThrashing,
    },
    incrementRectCalls
  );

  const isVisible = position?.isInViewport ?? false;
  const rect = position?.rect;

  return (
    <div
      ref={ref}
      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        isVisible
          ? "bg-red-100 border-red-400 shadow-md"
          : "bg-gray-100 border-gray-300 opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-700">Card #{index + 1}</span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isVisible ? "bg-red-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {isVisible ? "可见" : "不可见"}
        </span>
      </div>
      {rect && (
        <div className="text-xs font-mono text-gray-600 grid grid-cols-2 gap-1">
          <span>top: {Math.round(rect.top)}px</span>
          <span>left: {Math.round(rect.left)}px</span>
          <span>bottom: {Math.round(rect.bottom)}px</span>
          <span>right: {Math.round(rect.right)}px</span>
        </div>
      )}
    </div>
  );
});

/**
 * 使用 IntersectionObserver 的卡片
 */
const IntersectionCard: React.FC<CardProps> = memo(({ index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { incrementIOCallbacks } = usePerformanceContext();

  const { isVisible, intersectionRatio } = useIntersectionObserver(
    ref,
    { threshold: [0, 0.5, 1] },
    incrementIOCallbacks
  );

  return (
    <div
      ref={ref}
      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        isVisible
          ? "bg-green-100 border-green-400 shadow-md"
          : "bg-gray-100 border-gray-300 opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-700">Card #{index + 1}</span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isVisible ? "bg-green-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {isVisible ? "可见" : "不可见"}
        </span>
      </div>
      <div className="text-xs font-mono text-gray-600">
        <span>可见比例: {(intersectionRatio * 100).toFixed(0)}%</span>
        <div className="mt-1 h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${intersectionRatio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
});
