import { useEffect, useRef, useCallback } from "react";
import { usePerformanceContext } from "../context/PerformanceContext";

/**
 * 追踪主线程阻塞时间的 Hook
 * 使用 Long Tasks API 或 requestAnimationFrame 差值来估算
 */
export const useMainThreadBlockTime = () => {
  const { updateMetrics } = usePerformanceContext();
  const lastFrameTime = useRef(performance.now());
  const blockTimeAccumulator = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const measureBlockTime = () => {
      const now = performance.now();
      const frameDuration = now - lastFrameTime.current;

      // 如果帧间隔超过 50ms，认为主线程被阻塞了
      // 理想帧间隔是 16.67ms (60fps)
      if (frameDuration > 50) {
        blockTimeAccumulator.current += frameDuration - 16.67;
      }

      lastFrameTime.current = now;
      animationFrameId = requestAnimationFrame(measureBlockTime);
    };

    // 每秒更新一次阻塞时间
    const reportInterval = setInterval(() => {
      updateMetrics({
        mainThreadBlockTime: Math.round(blockTimeAccumulator.current),
      });
      blockTimeAccumulator.current = 0;
    }, 1000);

    animationFrameId = requestAnimationFrame(measureBlockTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(reportInterval);
    };
  }, [updateMetrics]);
};

/**
 * 制造 Layout Thrashing 的函数
 * 警告：这会严重影响性能，仅用于演示目的！
 */
export const useLayoutThrashing = (
  elementRef: React.RefObject<HTMLElement>,
  enabled: boolean
) => {
  const thrash = useCallback(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    // 🔥 恶意操作：强制浏览器反复重排
    // 这是"如何不应该写代码"的典型示例
    for (let i = 0; i < 50; i++) {
      // 读取 layout 属性（触发 reflow）
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      // 写入样式（使 layout 失效）
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
    }
  }, [elementRef, enabled]);

  return thrash;
};

/**
 * 创建一个计时器来测量函数执行时间
 */
export const useExecutionTimer = () => {
  const measure = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fn: () => any, label?: string): any => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;

      if (label && duration > 1) {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }

      return result;
    },
    []
  );

  return measure;
};

/**
 * 使用 PerformanceObserver 监控 Long Tasks
 * Long Task = 执行时间超过 50ms 的任务
 */
export const useLongTaskObserver = () => {
  const { updateMetrics } = usePerformanceContext();
  const longTaskCount = useRef(0);

  useEffect(() => {
    // 检查浏览器是否支持 PerformanceObserver
    if (!("PerformanceObserver" in window)) {
      console.warn("PerformanceObserver not supported");
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            longTaskCount.current++;
            console.warn(
              `🐌 Long Task detected: ${entry.duration.toFixed(2)}ms`
            );
          }
        }
      });

      observer.observe({ entryTypes: ["longtask"] });

      return () => observer.disconnect();
    } catch (e) {
      // longtask 类型可能不被支持
      console.warn("Long Task observation not supported");
    }
  }, [updateMetrics]);

  return longTaskCount;
};
