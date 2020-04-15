import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import { useScroll } from "./customHooks/useScroll";
import { useResizeObserver } from "./customHooks/useResizeObserver";
import { Pagination } from "./Pagination";
import styles from "./Table.module.scss";

const TableBodyBackground: React.FC<{ height: number }> = memo(({ height }) => {
  return (
    <div
      className={styles.TableBodyBackground}
      style={{
        height,
      }}
    ></div>
  );
});

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

export interface TableTheme {
  "--row-height": number;
  "--row-color": string;
  "--row-color-alternate": string;
  "--primary-color": string;
  "--text-color": string;
}

interface TableProps<TDataItem> {
  style: React.CSSProperties;
  onUpdate: (
    current: number,
    pageSize: number
  ) => Promise<TableDataAndPagination<TDataItem>>;
  theme?: TableTheme;
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
}

export const defaultTheme: TableTheme = {
  "--row-height": 30,
  "--row-color": "#fff",
  "--row-color-alternate": "#e2e2e2",
  "--primary-color": "#00af8b",
  "--text-color": "#404040",
};

export function Table<TDataItem>({
  style,
  onUpdate,
  theme = defaultTheme,
}: TableProps<TDataItem>) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<TableData<TDataItem> | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions | null>(null);

  const { scrollTo, scrollTop } = useScroll(bodyRef);
  const [, height] = useResizeObserver(bodyRef);

  const rowHeight = theme["--row-height"];

  useEffect(() => {
    if (!height) return;

    const pageSize = Math.ceil(height / rowHeight);

    const current = Math.ceil(scrollTop / (pageSize * rowHeight)) + 1;

    onUpdate(current, pageSize).then((result) => {
      setData((d) => mergeData(d, result));

      setPagination({
        current: result.current,
        pageSize: result.pageSize,
        total: result.total,
      });
    });
  }, [onUpdate, height, scrollTop, rowHeight]);

  style = useMemo(
    () =>
      ({
        ...theme,
        "--row-height": `${theme["--row-height"]}px`,
        ...style,
      } as React.CSSProperties),
    [style, theme]
  );

  return (
    <>
      <div className={styles.Table} style={style}>
        <div className={styles.TableHeader}>Table header</div>
        <div className={styles.TableBody} id="foo" ref={bodyRef}>
          {/* data.items.length === pagination.total */}
          {data && (
            <TableBodyBackground height={data.items.length * rowHeight} />
          )}
        </div>
        <div className={styles.TableFooter}>
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
        </div>
      </div>

      <pre>
        {data && data.items.length}
        <br />
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  );
}
