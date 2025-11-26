import { useEffect, useState, useRef } from "react";

/**
 * IntersectionObserver 版本的可见性检测
 *
 * 🎯 与 getBoundingClientRect 对比：
 * - ✅ 异步执行，不阻塞主线程
 * - ✅ 浏览器原生优化，性能更好
 * - ✅ 适合"是否可见"的二元判断
 * - ❌ 无法获取精确像素级位置
 * - ❌ 无法用于拖拽、碰撞检测等场景
 *
 * @param elementRef - 目标元素的 ref
 * @param options - IntersectionObserver 配置
 * @param onCallback - 每次触发回调时的统计函数
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {},
  onCallback?: () => void
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 统计回调触发次数
  const callbackCount = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setEntry(entry);
        setIsVisible(entry.isIntersecting);

        // 统计回调
        callbackCount.current++;
        onCallback?.();
      },
      {
        threshold: options.threshold ?? [0, 0.25, 0.5, 0.75, 1],
        rootMargin: options.rootMargin ?? "0px",
        root: options.root ?? null,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    elementRef,
    options.threshold,
    options.rootMargin,
    options.root,
    onCallback,
  ]);

  return {
    entry,
    isVisible,
    /** 可见比例 0-1 */
    intersectionRatio: entry?.intersectionRatio ?? 0,
    /** 元素边界矩形（注意：这是快照，不是实时的） */
    boundingClientRect: entry?.boundingClientRect ?? null,
    /** 回调触发次数 */
    callbackCount: callbackCount.current,
  };
};

/**
 * 简化版：只关心是否可见
 */
export const useIsVisible = (
  elementRef: React.RefObject<HTMLElement | null>,
  threshold = 0
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold]);

  return isVisible;
};

/**
 * 带懒加载功能的可见性检测
 * 一旦可见就停止观察（适合图片懒加载）
 */
export const useLazyLoad = (
  elementRef: React.RefObject<HTMLElement | null>
) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          observer.disconnect(); // 只触发一次
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, hasLoaded]);

  return hasLoaded;
};
