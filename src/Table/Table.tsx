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
import { Checkbox } from "./Checkbox";

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

const RowCheckbox = memo(
  (props: {
    row: number;
    checked?: boolean;
    onChange: (row: number) => void;
  }) => (
    <Checkbox
      checked={props.checked}
      onChange={(e) => props.onChange(props.row)}
    />
  )
);

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
  const [eachScrollTop, setEachScrollTop] = useState(0);

  const { scrollTo, scrollTop } = useScroll(bodyRef, setEachScrollTop);
  const [, height] = useResizeObserver(bodyRef);

  const rowHeight = theme["--row-height"];

  useEffect(() => {
    if (!height) return;

    async function updateIfNeeded(
      queries: Array<{ page: number; pageSize: number }>
    ): Promise<number> /* total */ {
      let ps: Array<Promise<TableDataAndPagination<TDataItem>>> = [];
      for (const q of queries) {
        if (!pageIsLoaded(data, q.page, q.pageSize)) {
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
      const pageSize = getPageSize(height, rowHeight),
        pages = getPagesForScrollTop(pageSize, rowHeight, scrollTop),
        queries = pages.map((page) => ({ page, pageSize }));

      const total = await updateIfNeeded(queries);

      setPagination({
        current: pages[pages.length - 1],
        pageSize: pageSize,
        total,
      });
    }

    doUpdate();
  }, [onUpdate, rowHeight, height, scrollTop, data]);

  style = useMemo(
    () =>
      ({
        ...theme,
        "--row-height": `${theme["--row-height"]}px`,
        ...style,
      } as React.CSSProperties),
    [style, theme]
  );

  const toggleCheck = useCallback((row: number) => {
    setChecked((checked) => {
      const newChecked = checked.slice(0);
      newChecked[row] = !newChecked[row];
      return newChecked;
    });
  }, []);

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

  const visibleRows = useMemo(
    () => getVisibleRows(eachScrollTop, height, rowHeight, data),
    [eachScrollTop, height, rowHeight, data]
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
                    <div className={`${styles.TableCell} checkable`}>
                      <RowCheckbox
                        row={i}
                        checked={!!checked[i]}
                        onChange={toggleCheck}
                      />
                    </div>
                  )}
                  {columns.map((c) => (
                    <div
                      key={c.key}
                      className={styles.TableCell}
                      style={{ width: c.width || "auto" }}
                    >
                      {data.items[i] ? data.items[i][c.dataIndex] : "..."}
                    </div>
                  ))}
                </div>
              ))}
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

const getPageSize = (viewHeight: number, rowHeight: number) =>
  Math.floor(viewHeight / rowHeight);

const getPagesForScrollTop = (
  pageSize: number,
  rowHeight: number,
  scrollTop: number
) => {
  const previous = Math.floor(scrollTop / (pageSize * rowHeight)) + 1,
    current = Math.ceil(scrollTop / (pageSize * rowHeight)) + 1;
  return previous === current ? [current] : [previous, current];
};

function pageIsLoaded<TDataItem>(
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
  rowHeight: number,
  data: TableData<any> | null
): number[] {
  if (!height || !data) return [];
  const from = Math.floor(scrollTop / rowHeight),
    to = Math.min(
      Math.ceil((scrollTop + height) / rowHeight),
      data.items.length
    );
  return Array.from(Array(to - from).keys()).map((i) => from + i);
}
