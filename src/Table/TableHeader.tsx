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
      {checkable && <div style={{ width: 50 }}></div>}
      {columns.map((c) => (
        <div key={c.key} style={{ width: c.width || "auto" }}>
          {c.title}
        </div>
      ))}
    </div>
  );
});
