import { useCallback, useMemo, useState } from "react";
import { Card } from "./components/Card";
import { VisualOverlay } from "./components/VisualOverlay";
import { PerformancePanel } from "./components/PerformancePanel";
import { ComparisonView } from "./components/ComparisonView";
import { TooltipDemoCard } from "./components/SmartTooltip";
import { CardProvider, useCardContext } from "./context/CardContext";
import {
  PerformanceProvider,
  usePerformanceContext,
} from "./context/PerformanceContext";
import { useFPS, useViewportInfo } from "./hooks/useElementPosition";
import { useMainThreadBlockTime } from "./hooks/usePerformanceMetrics";
import { BoundingRect } from "./types";
import { generateCards } from "./utils/cardGenerator";

// ============ Tab 类型 ============
type TabType = "basic" | "comparison" | "tooltip";

// ============ 主内容组件 ============
function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const fps = useFPS();
  const viewport = useViewportInfo();
  const { cardVisibility, hoveredCard } = useCardContext();
  const { metrics, updateMetrics } = usePerformanceContext();

  // 追踪主线程阻塞时间
  useMainThreadBlockTime();

  // 同步 FPS 到 metrics
  useMemo(() => {
    updateMetrics({ fps });
  }, [fps, updateMetrics]);

  const handleCardClick = useCallback(
    (cardId: number, rect: BoundingRect) => {
      console.log(`
【卡片 #${cardId} 的位置详情】

📍 相对视口的位置：
  • top (顶部): ${Math.round(rect.top)}px
  • left (左边): ${Math.round(rect.left)}px
  • bottom (底部): ${Math.round(rect.bottom)}px
  • right (右边): ${Math.round(rect.right)}px

📐 元素尺寸：
  • width: ${Math.round(rect.width)}px
  • height: ${Math.round(rect.height)}px

🖥️ 当前视口信息：
  • 视口宽度: ${viewport.width}px
  • 视口高度: ${viewport.height}px
  • 页面滚动距离: ${viewport.scrollY}px
    `);
    },
    [viewport]
  );

  const cards = useMemo(() => generateCards(5), []);

  const visibleCount = useMemo(() => {
    return Object.values(cardVisibility).filter((card) => card.isInViewport)
      .length;
  }, [cardVisibility]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* 🔝 Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-flask text-purple-600 text-2xl"></i>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              性能实验室: getBoundingClientRect
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                metrics.fps >= 50
                  ? "bg-green-100 text-green-700"
                  : metrics.fps >= 30
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              FPS: {metrics.fps}
            </span>
          </div>
        </div>
      </header>

      {/* 📑 Tab 导航 */}
      <div className="sticky top-[72px] z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <TabButton
              active={activeTab === "basic"}
              onClick={() => setActiveTab("basic")}
              icon="fa-cube"
              label="基础演示"
            />
            <TabButton
              active={activeTab === "comparison"}
              onClick={() => setActiveTab("comparison")}
              icon="fa-balance-scale"
              label="API 对比"
            />
            <TabButton
              active={activeTab === "tooltip"}
              onClick={() => setActiveTab("tooltip")}
              icon="fa-crosshairs"
              label="智能定位"
            />
          </div>
        </div>
      </div>

      {/* 📊 内容区域 */}
      <div className="flex">
        {/* 主内容 */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
          {activeTab === "basic" && (
            <BasicDemo
              cards={cards}
              onCardClick={handleCardClick}
              viewport={viewport}
              visibleCount={visibleCount}
            />
          )}

          {activeTab === "comparison" && <ComparisonView />}

          {activeTab === "tooltip" && <TooltipDemo />}
        </main>

        {/* 侧边栏：性能控制面板 */}
        <aside className="hidden lg:block w-80 p-4 sticky top-[120px] h-fit">
          <PerformancePanel />
        </aside>
      </div>

      {/* 移动端性能面板（底部悬浮） */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobilePerformanceBar />
      </div>

      {/* 🎯 可视化覆盖层 */}
      {activeTab === "basic" && (
        <VisualOverlay
          rect={hoveredCard?.rect || null}
          cardId={hoveredCard?.id || null}
          viewport={viewport}
        />
      )}
    </div>
  );
}

// ============ Tab 按钮 ============
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
      active
        ? "border-purple-600 text-purple-600"
        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
    }`}
  >
    <i className={`fas ${icon}`}></i>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// ============ 基础演示 ============
interface BasicDemoProps {
  cards: ReturnType<typeof generateCards>;
  onCardClick: (cardId: number, rect: BoundingRect) => void;
  viewport: { width: number; height: number; scrollY: number };
  visibleCount: number;
}

const BasicDemo: React.FC<BasicDemoProps> = ({
  cards,
  onCardClick,
  viewport,
  visibleCount,
}) => {
  return (
    <div className="space-y-6">
      {/* 仪表盘 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
          <p className="text-gray-600">视口高度</p>
          <p className="font-bold text-lg">{viewport.height}px</p>
        </div>
        <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
          <p className="text-gray-600">可见元素</p>
          <p className="font-bold text-lg">{visibleCount}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
          <p className="text-gray-600">不可见元素</p>
          <p className="font-bold text-lg">{cards.length - visibleCount}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
          <p className="text-gray-600">滚动距离</p>
          <p className="font-bold text-lg">{Math.round(viewport.scrollY)}px</p>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex gap-3">
          <i className="fas fa-lightbulb text-yellow-600 text-xl mt-1"></i>
          <div className="text-sm">
            <p className="font-bold text-gray-800">💡 基础演示</p>
            <p className="text-gray-700 mt-2">
              🖱️ 鼠标悬浮查看可视化边界 | 📊 右侧面板可调整性能参数 | ⚠️
              开启"Layout Thrashing"观察卡顿
            </p>
          </div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-6">
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>

      {/* 坐标系说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start gap-4">
          <i className="fas fa-info-circle text-blue-600 text-2xl mt-1"></i>
          <div>
            <p className="font-bold text-gray-800 mb-2">📍 坐标系参考</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p>
                  <strong>top:</strong> 元素顶部到视口顶部的距离
                </p>
                <p>
                  <strong>left:</strong> 元素左边到视口左边的距离
                </p>
              </div>
              <div>
                <p>
                  <strong>bottom:</strong> 元素底部到视口顶部的距离
                </p>
                <p>
                  <strong>right:</strong> 元素右边到视口左边的距离
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Tooltip 演示 ============
const TooltipDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
        <div className="flex gap-3">
          <i className="fas fa-crosshairs text-indigo-600 text-xl mt-1"></i>
          <div className="text-sm">
            <p className="font-bold text-gray-800">🎯 智能 Tooltip 定位</p>
            <p className="text-gray-700 mt-2">
              这是{" "}
              <code className="bg-white px-1 rounded">
                getBoundingClientRect
              </code>{" "}
              <strong>不可替代</strong> 的应用场景。Tooltip
              会根据目标元素在视口的位置，智能选择显示方向（上/下/左/右），并确保不会溢出视口边界。
            </p>
          </div>
        </div>
      </div>

      {/* 演示区域 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-mouse-pointer text-purple-500"></i>
          悬浮查看效果
        </h3>

        {/* 网格布局，让卡片分布在不同位置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
          {/* 顶部 */}
          <div className="flex items-start justify-center pt-4">
            <TooltipDemoCard index={0} />
          </div>
          <div className="flex items-start justify-center pt-4">
            <TooltipDemoCard index={1} />
          </div>
          <div className="flex items-start justify-center pt-4">
            <TooltipDemoCard index={2} />
          </div>

          {/* 中间 */}
          <div className="flex items-center justify-start pl-4">
            <TooltipDemoCard index={3} />
          </div>
          <div className="flex items-center justify-center">
            <TooltipDemoCard index={4} />
          </div>
          <div className="flex items-center justify-end pr-4">
            <TooltipDemoCard index={5} />
          </div>

          {/* 底部 */}
          <div className="flex items-end justify-center pb-4">
            <TooltipDemoCard index={6} />
          </div>
          <div className="flex items-end justify-center pb-4">
            <TooltipDemoCard index={7} />
          </div>
          <div className="flex items-end justify-center pb-4">
            <TooltipDemoCard index={8} />
          </div>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-3">🔧 实现原理</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            1. 使用{" "}
            <code className="bg-white px-1 rounded">
              getBoundingClientRect()
            </code>{" "}
            获取目标元素的精确位置
          </p>
          <p>2. 计算上/下/左/右四个方向的可用空间</p>
          <p>3. 选择空间最充足的方向显示 Tooltip</p>
          <p>4. 确保 Tooltip 不会超出视口边界</p>
          <p className="text-indigo-600 font-medium mt-3">
            ⚡ IntersectionObserver
            无法做到这一点——它只能告诉你元素"是否可见"，不能提供精确坐标。
          </p>
        </div>
      </div>
    </div>
  );
};

// ============ 移动端性能栏 ============
const MobilePerformanceBar: React.FC = () => {
  const { metrics, settings, updateSettings } = usePerformanceContext();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 text-white">
      {/* 展开的面板 */}
      {expanded && (
        <div className="p-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={settings.enableThrottle}
                onChange={(e) =>
                  updateSettings({ enableThrottle: e.target.checked })
                }
              />
              节流
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={settings.enablePassive}
                onChange={(e) =>
                  updateSettings({ enablePassive: e.target.checked })
                }
              />
              Passive
            </label>
            <label className="flex items-center gap-1 text-red-400">
              <input
                type="checkbox"
                checked={settings.enableLayoutThrashing}
                onChange={(e) =>
                  updateSettings({ enableLayoutThrashing: e.target.checked })
                }
              />
              Thrashing
            </label>
          </div>
        </div>
      )}

      {/* 底部栏 */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 text-xs">
          <span
            className={
              metrics.fps >= 50
                ? "text-green-400"
                : metrics.fps >= 30
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            FPS: {metrics.fps}
          </span>
          <span>Scroll: {metrics.scrollEventsPerSecond}/s</span>
          <span>Rect: {metrics.rectCallsPerSecond}/s</span>
        </div>
        <i className={`fas fa-chevron-${expanded ? "down" : "up"}`}></i>
      </div>
    </div>
  );
};

// ============ App 根组件 ============
function App() {
  return (
    <PerformanceProvider>
      <CardProvider>
        <AppContent />
      </CardProvider>
    </PerformanceProvider>
  );
}

export default App;
