import {
  useEffect,
  useRef,
  DependencyList,
  useState,
  useCallback,
} from "react";

export function useAutoScroll<T extends HTMLDivElement>(
  deps: DependencyList = [],
) {
  const ref = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  const checkScrollPosition = useCallback(() => {
    const element = ref.current;
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;

      // if content doesn't overflow, always consider at bottom
      if (scrollHeight <= clientHeight) {
        setIsAtBottom(true);
        return;
      }

      // almost scrolled to bottom (97%)
      const scrollPercent = (scrollTop + clientHeight) / scrollHeight;
      const atBottom = scrollPercent >= 0.97;
      setIsAtBottom(atBottom);
    }
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (element) {
      element.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [checkScrollPosition]);

  useEffect(() => {
    checkScrollPosition();
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [deps, checkScrollPosition, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();

      // if we were at bottom before resize, stay at bottom
      if (isAtBottom) {
        scrollToBottom();
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, isAtBottom, scrollToBottom]);

  return { ref, isAtBottom, scrollToBottom };
}
