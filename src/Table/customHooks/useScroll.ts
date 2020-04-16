import { useEffect, useCallback, useState, useMemo } from "react";
import smoothscroll from "smoothscroll-polyfill";
import debounce from "lodash/fp/debounce"; // todo: не тащить за собой библиотеку из-за одной функции

smoothscroll.polyfill();

export function useScroll(
  targetRef: React.RefObject<HTMLElement>,
  onScroll?: (top: number) => void,
  wait = 300
) {
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    console.warn("add scroll listeners. only once");

    const onScrollDebounced = debounce(wait, () => {
      setScrollTop(targetRef.current!.scrollTop);
    });

    function onEachScroll() {
      onScroll && onScroll(targetRef.current!.scrollTop);
    }

    const target = targetRef.current!;
    target.addEventListener("scroll", onEachScroll);
    target.addEventListener("scroll", onScrollDebounced);

    return () => {
      target.removeEventListener("onscroll", onEachScroll);
      target.removeEventListener("onscroll", onScrollDebounced);
    };
  }, [targetRef, onScroll, wait]);

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
