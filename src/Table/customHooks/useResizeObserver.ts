import { useEffect, useState, useMemo } from "react";
import ResizeObserver from "resize-observer-polyfill";

export function useResizeObserver(targetRef: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    console.warn("create resize observer. only once");

    const observer = new ResizeObserver((entries: Array<any>) => {
      const { width, height } = entries[0].contentRect;
      setSize([width, height]);
    });

    const target = targetRef.current;
    observer.observe(target!);

    return () => observer.unobserve(target!);
  }, [targetRef]);

  // is it ok?
  return useMemo(() => size, [size]);
}
