import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
  useCallback,
} from "react";
import { useScroll } from "./customHooks/useScroll";
import { useResizeObserver } from "./customHooks/useResizeObserver";
import { Pagination } from "./Pagination";
import styles from "./Table.module.scss";
import {
  TableTheme,
  TableProps,
  TableData,
  PaginationOptions,
  TableDataAndPagination,
  BaseDataItem,
} from "./interface";
import { TableHeader } from "./TableHeader";

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

export const defaultTheme: TableTheme = {
  "--row-height": 25,
  "--row-color": "#fff",
  "--row-color-alternate": "#e2e2e2",
  "--primary-color": "#00af8b",
  "--text-color": "#404040",
};

export function Table<TDataItem extends BaseDataItem>({
  style,
  onUpdate,
  columns,
  checkable,
  theme = defaultTheme,
}: TableProps<TDataItem>) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<TableData<TDataItem> | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);

  const { scrollTo, scrollTop } = useScroll(bodyRef);
  const [, height] = useResizeObserver(bodyRef);

  const rowHeight = theme["--row-height"];

  useEffect(() => {
    if (!height) return;

    async function updateIfNeeded(
      queries: Array<{ page: number; pageSize: number }>
    ): Promise<number> /* total */ {
      let ps: Array<Promise<TableDataAndPagination<TDataItem>>> = [];
      for (const q of queries) {
        if (!pageLoaded(data, q.page, q.pageSize)) {
          ps.push(onUpdate(q.page, q.pageSize));
        }
      }
      if (!ps.length) return data!.items.length;
      const results = await Promise.all(ps);
      setData((d) => mergeData(d, results));
      return results[0].total;
    }

    // todo: разобраться почему высота меняется 2жды в начале
    async function doUpdate() {
      const pageSize = Math.ceil(height / rowHeight),
        current = Math.ceil(scrollTop / (pageSize * rowHeight)) + 1,
        prev = Math.floor(scrollTop / (pageSize * rowHeight)) + 1,
        twoPages = current !== prev,
        queries = twoPages
          ? [
              { page: prev, pageSize },
              { page: current, pageSize },
            ]
          : [{ page: current, pageSize }];

      const total = await updateIfNeeded(queries);

      setPagination({
        current: current,
        pageSize: pageSize,
        total,
      });
    }

    doUpdate();
  }, [onUpdate, height, scrollTop, rowHeight, data]);

  const visibleRows = useMemo(
    () => getVisibleRows(scrollTop, height, rowHeight),
    [scrollTop, height, rowHeight]
  );

  style = useMemo(
    () =>
      ({
        ...theme,
        "--row-height": `${theme["--row-height"]}px`,
        ...style,
      } as React.CSSProperties),
    [style, theme]
  );

  function toggleCheck(row: number) {
    const newChecked = checked.slice(0);
    newChecked[row] = !newChecked[row];
    setChecked(newChecked);
  }

  const onChangePage = useCallback(
    ({ page: newPage }: { page: number }) => {
      scrollTo(
        calculateScrollTop(
          { ...pagination!, current: newPage },
          rowHeight,
          height
        )
      );
    },
    [height, pagination, rowHeight, scrollTo]
  );

  return (
    <>
      <div className={styles.Table} style={style}>
        <TableHeader checkable={checkable} columns={columns} />
        <div className={styles.TableBody} ref={bodyRef}>
          {/* data.items.length === pagination.total */}
          {data && (
            <>
              <TableBodyBackground height={data.items.length * rowHeight} />
              {/* Rows */}
              {visibleRows.map((i) => (
                <div
                  className={styles.TableRow}
                  key={i}
                  style={{ top: i * rowHeight }}
                >
                  {checkable && (
                    <div style={{ width: 50 }}>
                      <input
                        type="checkbox"
                        checked={!!checked[i]}
                        onChange={() => toggleCheck(i)}
                      />
                    </div>
                  )}
                  {columns.map((c) => (
                    <div key={c.key} style={{ width: c.width || "auto" }}>
                      {data.items[i] ? data.items[i][c.dataIndex] : "..."}
                    </div>
                  ))}
                </div>
              ))}
              )}
            </>
          )}
        </div>
        <div className={styles.TableFooter}>
          {pagination && <Pagination {...pagination} onChange={onChangePage} />}
        </div>
      </div>
    </>
  );
}

function mergeData<TDataItem>(
  data: TableData<TDataItem> | null,
  results: TableDataAndPagination<TDataItem>[]
): TableData<TDataItem> {
  if (data == null) {
    data = { items: Array<TDataItem>(results[0].total) };
  }
  return results.reduce<TableData<TDataItem>>(
    (acc, res) => {
      const { current, pageSize, items } = res;
      for (
        let i = (current - 1) * pageSize, to = i + items.length, j = 0;
        i < to;
        i++, j++
      ) {
        acc.items[i] = items[j];
      }
      return acc;
    },
    {
      ...data,
      items: data.items.slice(0), // copy array
    }
  );
}

function pageLoaded<TDataItem>(
  data: TableData<TDataItem> | null,
  page: number,
  pageSize: number
) {
  if (data == null) return false;
  // todo: проверить границы
  for (
    let i = (page - 1) * pageSize,
      to = Math.min(data.items.length, i + pageSize);
    i < to;
    i++
  ) {
    if (data.items[i] == null) {
      return false;
    }
  }
  return true;
}

function calculateScrollTop(
  pagination: PaginationOptions,
  rowHeight: number,
  height: number
) {
  return Math.min(
    pagination.pageSize * rowHeight * (pagination.current - 1),
    Math.floor(pagination.total * rowHeight - height)
  );
}

function getVisibleRows(
  scrollTop: number,
  height: number,
  rowHeight: number
): number[] {
  if (!height) return [];
  const from = Math.floor(scrollTop / rowHeight),
    to = Math.ceil((scrollTop + height) / rowHeight);
  return Array.from(Array(to - from).keys()).map((i) => from + i); // { from, to };
}
