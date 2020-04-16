import React, { memo } from "react";
import styles from "./Table.module.scss";
import { Column } from "./interface";

const typedMemo: <T>(c: T) => T = memo;

export interface TableHeaderProps<TDataItem> {
  columns: Column<TDataItem>[];
  checkable?: boolean;
}

export const TableHeader = typedMemo(function TableHeader<TDataItem>({
  columns,
  checkable,
}: TableHeaderProps<TDataItem>) {
  return (
    <div className={styles.TableHeader}>
      {checkable && <div className={`${styles.TableCell} checkable`}></div>}
      {columns.map((c) => (
        <div
          key={c.key}
          className={styles.TableCell}
          style={{ width: c.width || "auto" }}
        >
          {c.title}
        </div>
      ))}
    </div>
  );
});
