import React, { useEffect, useRef, useCallback, useState } from "react";
import { useScroll } from "../customHooks/useScroll";
import { useResizeObserver } from "../customHooks/useResizeObserver";

const rowHeight = 30;

const gradientBackground = `repeating-linear-gradient(
  180deg,
  red,
  red ${rowHeight}px,
  blue ${rowHeight}px,
  blue ${rowHeight * 2}px
)`;

const TableBg: React.FC<{ height: number }> = ({ height }) => {
  return (
    <div
      style={{
        height,
        background: gradientBackground,
      }}
    ></div>
  );
};

const Pagination: React.FC<{
  pageSize: number;
  current: number;
  total: number;
  onChange: (e: { page: number }) => void;
}> = ({ pageSize, current, total, onChange }) => {
  const pages = Math.ceil(total / pageSize);
  return (
    <div>
      {Array.from(Array(pages).keys()).map((p) => (
        <button
          key={p}
          style={current === p + 1 ? { fontWeight: "bold", color: "red" } : {}}
          onClick={() => onChange({ page: p + 1 })}
        >
          {p + 1}
        </button>
      ))}
    </div>
  );
};

export interface TableData<TDataItem> {
  items: TDataItem[];
}

interface PaginationOptions {
  current: number;
  pageSize: number;
  total: number;
}

type TableDataAndPagination<TDataItem> = TableData<TDataItem> &
  PaginationOptions;

interface TableProps<TDataItem> {
  style: React.CSSProperties;
  onUpdate: (
    current: number,
    pageSize: number
  ) => Promise<TableDataAndPagination<TDataItem>>;
}

function mergeData<TDataItem>(
  data: TableData<TDataItem> | null,
  result: TableDataAndPagination<TDataItem>
): TableData<TDataItem> {
  if (data == null) {
    data = { items: Array<TDataItem>(result.total) };
  }
  // create new array
  return {
    items: [
      ...data.items.slice(0, (result.current - 1) * result.pageSize),
      ...result.items,
      ...data.items.slice(
        (result.current - 1) * result.pageSize + result.items.length
      ),
    ],
  };
  return data!;
}

export function Table<TDataItem>({ style, onUpdate }: TableProps<TDataItem>) {
  const ref = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<TableData<TDataItem> | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions | null>(null);

  const [scroll, setScroll] = useState<{
    top: number;
    source: "user" | "program";
  }>({ top: 0, source: "user" });

  onUpdate = useCallback(onUpdate, []);

  const scrollTo = useScroll({
    targetRef: ref,
    onEnd: (e) => {
      console.log("scroll end", e);
      setScroll(e);
    },
  });

  const [_, height] = useResizeObserver({
    targetRef: ref,
    onResize: ({ width, height }) => {
      console.log("Resize", { width, height });
    },
  });

  useEffect(() => {
    if (!height) return;

    const pageSize = Math.ceil(height / rowHeight);

    const current = Math.ceil(scroll.top / (pageSize * rowHeight)) + 1;

    onUpdate(current, pageSize).then((result) => {
      setData(mergeData(data, result));

      setPagination({
        current: result.current,
        pageSize: result.pageSize,
        total: result.total,
      });
    });
  }, [onUpdate, height, scroll]);

  return (
    <>
      <div
        style={{ ...style, overflowY: "auto", background: "#0080003b" }}
        ref={ref}
      >
        {/* data.items.length === pagination.total */}
        {data && <TableBg height={data.items.length * rowHeight} />}
      </div>

      {pagination && (
        <Pagination
          {...pagination}
          onChange={({ page }) => {
            const top = Math.min(
              pagination.pageSize * rowHeight * (page - 1),
              Math.floor(pagination.total * rowHeight - height)
            );
            scrollTo(top);
          }}
        />
      )}

      <pre>
        {data && data.items.length}
        <br />
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  );
}
