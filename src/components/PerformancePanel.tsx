import React, { memo } from "react";
import { usePerformanceContext } from "../context/PerformanceContext";

/**
 * 性能控制面板
 *
 * 允许用户切换各种优化策略，亲眼看到性能差异
 */
export const PerformancePanel = memo(() => {
  const { settings, updateSettings, resetSettings, metrics } =
    usePerformanceContext();

  return (
    <div className="performance-panel bg-gray-900 text-white p-4 rounded-lg shadow-xl">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <i className="fas fa-flask text-purple-400"></i>
          性能实验室
        </h3>
        <button
          onClick={resetSettings}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        >
          重置
        </button>
      </div>

      {/* 开关区域 */}
      <div className="space-y-3 mb-4">
        {/* Throttle 开关 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">节流 (Throttle)</span>
            <p className="text-xs text-gray-400">关闭后每像素都计算</p>
          </div>
          <ToggleSwitch
            checked={settings.enableThrottle}
            onChange={(v) => updateSettings({ enableThrottle: v })}
            colorOn="bg-green-500"
            colorOff="bg-red-500"
          />
        </div>

        {/* Passive 开关 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">Passive 监听</span>
            <p className="text-xs text-gray-400">关闭后阻塞滚动</p>
          </div>
          <ToggleSwitch
            checked={settings.enablePassive}
            onChange={(v) => updateSettings({ enablePassive: v })}
            colorOn="bg-green-500"
            colorOff="bg-red-500"
          />
        </div>

        {/* Layout Thrashing 开关 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-red-400 font-bold">
              ⚠️ Layout Thrashing
            </span>
            <p className="text-xs text-gray-400">强制重排（严重卡顿）</p>
          </div>
          <ToggleSwitch
            checked={settings.enableLayoutThrashing}
            onChange={(v) => updateSettings({ enableLayoutThrashing: v })}
            colorOn="bg-red-600"
            colorOff="bg-gray-600"
          />
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-gray-700 my-3"></div>

      {/* 性能指标 */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          📊 实时指标
        </h4>

        <MetricRow
          label="FPS"
          value={metrics.fps}
          unit=""
          warning={metrics.fps < 30}
          danger={metrics.fps < 15}
        />

        <MetricRow
          label="Scroll 事件/秒"
          value={metrics.scrollEventsPerSecond}
          unit=""
          warning={metrics.scrollEventsPerSecond > 60}
          danger={metrics.scrollEventsPerSecond > 100}
        />

        <MetricRow
          label="getBoundingRect 调用/秒"
          value={metrics.rectCallsPerSecond}
          unit=""
          warning={metrics.rectCallsPerSecond > 100}
          danger={metrics.rectCallsPerSecond > 300}
        />

        <MetricRow
          label="IO 回调/秒"
          value={metrics.ioCallbacksPerSecond}
          unit=""
        />

        <MetricRow
          label="主线程阻塞"
          value={metrics.mainThreadBlockTime}
          unit="ms"
          warning={metrics.mainThreadBlockTime > 50}
          danger={metrics.mainThreadBlockTime > 100}
        />
      </div>

      {/* 警告提示 */}
      {settings.enableLayoutThrashing && (
        <div className="mt-3 p-2 bg-red-900 rounded text-xs">
          🔥 Layout Thrashing 已开启！这会导致严重卡顿，仅用于演示目的。
        </div>
      )}

      {!settings.enableThrottle && (
        <div className="mt-3 p-2 bg-yellow-900 rounded text-xs">
          ⚠️ 节流已关闭！滚动时会触发大量计算。
        </div>
      )}
    </div>
  );
});

// ============ 子组件 ============

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  colorOn?: string;
  colorOff?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  colorOn = "bg-blue-500",
  colorOff = "bg-gray-600",
}) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? colorOn : colorOff
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
};

interface MetricRowProps {
  label: string;
  value: number;
  unit: string;
  warning?: boolean;
  danger?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  unit,
  warning,
  danger,
}) => {
  let textColor = "text-green-400";
  if (danger) textColor = "text-red-400";
  else if (warning) textColor = "text-yellow-400";

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-mono font-bold ${textColor}`}>
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
};
