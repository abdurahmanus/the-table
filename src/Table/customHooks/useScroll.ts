import { useEffect, useCallback, useState, useMemo } from "react";
import smoothscroll from "smoothscroll-polyfill";
import debounce from "lodash/debounce"; // todo: не тащить за собой библиотеку из-за одной функции

smoothscroll.polyfill();

export function useScroll(targetRef: React.RefObject<HTMLElement>, wait = 300) {
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    console.warn("add scroll listeners. only once");

    const onScrollHandler = debounce(() => {
      setScrollTop(targetRef.current!.scrollTop);
    }, wait);

    const target = targetRef.current!;
    target.addEventListener("scroll", onScrollHandler);

    return () => {
      target.removeEventListener("onscroll", onScrollHandler);
    };
  }, [targetRef, wait]);

  const scrollTo = useCallback(
    (top: number) => {
      targetRef.current!.scrollTo({
        top,
        behavior: "smooth",
      });
    },
    [targetRef]
  );

  return useMemo(() => ({ scrollTo, scrollTop }), [scrollTo, scrollTop]);
}
