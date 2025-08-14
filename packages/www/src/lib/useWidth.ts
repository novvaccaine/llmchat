import { useState, useEffect, useRef } from "react";

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Set initial width
    setWidth(element.getBoundingClientRect().width);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === element) {
          setWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [ref, width] as const;
}

export default useWidth;
