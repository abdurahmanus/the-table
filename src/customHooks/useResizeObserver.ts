import { useEffect, useState, useMemo, useCallback } from "react";

export function useResizeObserver({
  targetRef,
  onResize,
}: {
  targetRef: React.RefObject<HTMLElement>;
  onResize: (o: { width: number; height: number }) => void;
}) {
  const [size, setSize] = useState([0, 0]);

  onResize = useCallback(onResize, []);

  useEffect(() => {
    console.warn("create resize observer. only once");
    // @ts-ignore
    const observer = new ResizeObserver((entries: Array<any>) => {
      setSize([entries[0].contentRect.width, entries[0].contentRect.height]);
      onResize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });

    const target = targetRef.current;
    observer.observe(target);

    return () => observer.unobserve(target);
  }, [targetRef, onResize]);

  return useMemo(() => size, [size]);
}
