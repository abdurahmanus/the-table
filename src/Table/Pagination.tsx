import React from "react";
import styles from "./Table.module.scss";

function pageButtons(
  total: number,
  pageSize: number,
  current: number
): Array<number | "..."> {
  const pagesCount = Math.ceil(total / pageSize);
  // [< Prev], [ 1 ], [ 2 ], [ 3 ], [...], [ 5 ], [Next >]
  // max 5 кнопок
  // [1],2,3,...,7
  // 1,[2],3,...,7
  // 1,...,[3],...,7
  // 1,...,[4],...,7
  // 1,...,[5],...,7
  // 1,...,5,[6],7
  // 1,...,5,6,[7]
  const mid: Array<number | "..."> =
    current < 3
      ? [2, 3, "..."]
      : current > pagesCount - 3
      ? ["...", pagesCount - 2, pagesCount - 1]
      : ["...", current, "..."];

  return [1, ...mid, pagesCount];
}

// todo: optimize, refactor
export const Pagination: React.FC<{
  pageSize: number;
  current: number;
  total: number;
  onChange: (e: { page: number }) => void;
}> = ({ pageSize, current, total, onChange }) => {
  const pagesCount = Math.ceil(total / pageSize);

  return (
    <div className={styles.Pagination}>
      <button
        disabled={current === 1}
        onClick={() => onChange({ page: current - 1 })}
      >
        {"<"} Previous
      </button>
      {pageButtons(total, pageSize, current).map((x, index) => {
        const isNumber = typeof x === "number";
        return (
          <button
            key={isNumber ? x : `-${index}-`}
            className={current === x ? "active" : undefined}
            disabled={!isNumber}
            onClick={() => onChange({ page: +x })}
          >
            {x}
          </button>
        );
      })}
      <button
        disabled={current === pagesCount}
        onClick={() => onChange({ page: current + 1 })}
      >
        Next {">"}
      </button>
    </div>
  );
};
