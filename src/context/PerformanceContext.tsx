import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { PerformanceSettings, PerformanceMetrics } from "../types";

// ============ 默认值 ============

const defaultSettings: PerformanceSettings = {
  enableThrottle: true,
  enablePassive: true,
  enableLayoutThrashing: false,
  throttleInterval: 16, // ~60fps
};

const defaultMetrics: PerformanceMetrics = {
  fps: 0,
  scrollEventsPerSecond: 0,
  mainThreadBlockTime: 0,
  rectCallsPerSecond: 0,
  ioCallbacksPerSecond: 0,
};

// ============ Context 类型 ============

interface PerformanceContextType {
  // 设置
  settings: PerformanceSettings;
  updateSettings: (partial: Partial<PerformanceSettings>) => void;
  resetSettings: () => void;

  // 指标
  metrics: PerformanceMetrics;
  updateMetrics: (partial: Partial<PerformanceMetrics>) => void;

  // 计数器（用于统计每秒调用次数）
  incrementRectCalls: () => void;
  incrementIOCallbacks: () => void;
  incrementScrollEvents: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined
);

// ============ Provider ============

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] =
    useState<PerformanceSettings>(defaultSettings);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(defaultMetrics);

  // 用于计数的 refs（避免频繁 setState）
  const rectCallsRef = useRef(0);
  const ioCallbacksRef = useRef(0);
  const scrollEventsRef = useRef(0);

  // 每秒更新一次统计数据
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        rectCallsPerSecond: rectCallsRef.current,
        ioCallbacksPerSecond: ioCallbacksRef.current,
        scrollEventsPerSecond: scrollEventsRef.current,
      }));
      // 重置计数器
      rectCallsRef.current = 0;
      ioCallbacksRef.current = 0;
      scrollEventsRef.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<PerformanceSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const updateMetrics = useCallback((partial: Partial<PerformanceMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...partial }));
  }, []);

  const incrementRectCalls = useCallback(() => {
    rectCallsRef.current++;
  }, []);

  const incrementIOCallbacks = useCallback(() => {
    ioCallbacksRef.current++;
  }, []);

  const incrementScrollEvents = useCallback(() => {
    scrollEventsRef.current++;
  }, []);

  const value: PerformanceContextType = {
    settings,
    updateSettings,
    resetSettings,
    metrics,
    updateMetrics,
    incrementRectCalls,
    incrementIOCallbacks,
    incrementScrollEvents,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// ============ Hook ============

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error(
      "usePerformanceContext must be used within a PerformanceProvider"
    );
  }
  return context;
};
