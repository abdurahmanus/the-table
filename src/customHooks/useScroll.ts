import { useRef, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

export function useScroll({
  targetRef,
  onEnd,
}: {
  targetRef: React.RefObject<HTMLElement>;
  onEnd: (o: { source: "program" | "user"; top: number }) => void;
}) {
  const scrollTarget = useRef<number | null>(null);

  onEnd = useCallback(onEnd, []);

  useEffect(() => {
    console.warn("add event listeners (should be once)");

    const onScrollHandler = debounce(() => {
      console.log(targetRef.current!.scrollTop);

      if (scrollTarget.current != null) {
        // program scroll
        if (targetRef.current!.scrollTop === scrollTarget.current) {
          onEnd({ source: "program", top: targetRef.current!.scrollTop });
          scrollTarget.current = null;
        }
      } else {
        // user scroll
        onEnd({ source: "user", top: targetRef.current!.scrollTop });
      }
    }, 300);

    const target = targetRef.current!;
    target.addEventListener("scroll", onScrollHandler);

    return () => {
      target.removeEventListener("onscroll", onScrollHandler);
    };
  }, [targetRef, onEnd]);

  const scrollTo = useCallback(
    (top: number) => {
      console.log("scroll target = ", top);
      scrollTarget.current = top;
      targetRef.current!.scrollTo({
        top,
        behavior: "smooth",
      });
    },
    [targetRef]
  );

  return scrollTo;
}
