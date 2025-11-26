import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { throttle } from "lodash";
import {
  BoundingRect,
  ElementPosition,
  ViewportInfo,
  PerformanceSettings,
} from "../types";

// ============ 默认性能设置 ============
const defaultSettings: PerformanceSettings = {
  enableThrottle: true,
  enablePassive: true,
  enableLayoutThrashing: false,
  throttleInterval: 16,
};

/**
 * 实时追踪某个 DOM 元素在视口内的几何信息与可见状态。
 *
 * 🔧 性能实验室版本：支持动态切换优化策略
 * - enableThrottle: 关闭后每像素滚动都计算（性能杀手）
 * - enablePassive: 关闭后会阻塞滚动（卡顿）
 * - enableLayoutThrashing: 开启后制造强制重排（严重卡顿）
 *
 * @param elementRef - 指向目标元素的 ref
 * @param settings - 性能设置（可选）
 * @param onRectCall - 每次调用 getBoundingClientRect 时的回调（用于统计）
 * @returns 当前元素位置、是否可见、完全可见状态及友好文案
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const pos = useElementPosition(ref, { enableThrottle: false }); // 关闭节流
 */
export const useElementPosition = (
  elementRef: React.RefObject<HTMLElement | null>,
  settings: Partial<PerformanceSettings> = {},
  onRectCall?: () => void
) => {
  const [position, setPosition] = useState<ElementPosition | null>(null);

  // 合并设置
  const finalSettings = useMemo(
    () => ({ ...defaultSettings, ...settings }),
    [settings]
  );

  const updatePosition = useCallback(() => {
    if (!elementRef.current) return;

    // 📊 统计 getBoundingClientRect 调用次数
    onRectCall?.();

    // 🔥 Layout Thrashing: 恶意操作，强制浏览器反复重排
    if (finalSettings.enableLayoutThrashing) {
      const element = elementRef.current;
      for (let i = 0; i < 30; i++) {
        // 交替读写 layout 属性，制造重排风暴
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        element.style.opacity = `${0.99 + Math.random() * 0.01}`;
        // 强制同步 layout
        void element.offsetWidth;
      }
    }

    const rect = elementRef.current.getBoundingClientRect();
    const boundingRect: BoundingRect = {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };

    const isInViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    const isFullyVisible =
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth;

    let status = "❌ 完全不可见";
    if (isFullyVisible) {
      status = "✅ 完全可见";
    } else if (isInViewport) {
      status = "⚠️ 部分可见";
    } else if (rect.top < 0) {
      status = "⬆️ 滚出上方";
    } else if (rect.top > window.innerHeight) {
      status = "⬇️ 在下方";
    }

    setPosition({
      rect: boundingRect,
      isInViewport,
      isFullyVisible,
      status,
    });
  }, [elementRef, finalSettings.enableLayoutThrashing, onRectCall]);

  // 根据设置决定是否节流
  const throttledUpdatePosition = useMemo(() => {
    if (finalSettings.enableThrottle) {
      return throttle(updatePosition, finalSettings.throttleInterval);
    }
    // 不节流：每次事件都执行（性能杀手！）
    return updatePosition;
  }, [
    updatePosition,
    finalSettings.enableThrottle,
    finalSettings.throttleInterval,
  ]);

  useEffect(() => {
    throttledUpdatePosition();

    // 根据设置决定是否 passive
    const scrollOptions = finalSettings.enablePassive
      ? { passive: true }
      : { passive: false };

    window.addEventListener("scroll", throttledUpdatePosition, scrollOptions);
    window.addEventListener("resize", throttledUpdatePosition);

    return () => {
      window.removeEventListener("scroll", throttledUpdatePosition);
      window.removeEventListener("resize", throttledUpdatePosition);
      // 如果是节流函数，取消待执行的调用
      if ("cancel" in throttledUpdatePosition) {
        (throttledUpdatePosition as ReturnType<typeof throttle>).cancel();
      }
    };
  }, [throttledUpdatePosition, finalSettings.enablePassive]);

  return position;
};
/**
 * 订阅视口尺寸与垂直滚动距离。
 * - 首次挂载立即赋值，后续在 resize/scroll 时更新。
 * - 滚动事件默认 passive，避免阻塞。
 *
 * @returns 当前视口宽度、高度及 `window.scrollY`
 *
 * @example
 * const { width, height, scrollY } = useViewportInfo();
 * // 滚动超出 300px 时做吸顶
 */
export const useViewportInfo = () => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    scrollY: 0,
  });

  const updateViewport = useCallback(() => {
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY,
    });
  }, []);

  useEffect(() => {
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", updateViewport, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", updateViewport);
    };
  }, [updateViewport]);

  return viewport;
};
/**
 * 基于 `requestAnimationFrame` 计算页面实时 FPS。
 * - 每秒更新一次，精度±1 帧。
 * - 组件卸载时自动取消动画帧，防止泄漏。
 *
 * @returns 当前 FPS 数值（0 表示尚未采样完成）
 *
 * @example
 * const fps = useFPS();
 * fps < 30 && console.warn('性能掉帧');
 */
export const useFPS = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const calculateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return fps;
};
