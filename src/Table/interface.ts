export interface BaseDataItem {
  [key: string]: any;
}

export interface Column<TDataItem> {
  title: string;
  key: string;
  dataIndex: keyof TDataItem;
  width?: number;
}

export interface TableTheme {
  "--row-height": number;
  "--row-color": string;
  "--row-color-alternate": string;
  "--primary-color": string;
  "--text-color": string;
}

export interface TableData<TDataItem> {
  items: TDataItem[];
}

export interface PaginationOptions {
  current: number;
  pageSize: number;
  total: number;
}

export type TableDataAndPagination<TDataItem> = TableData<TDataItem> &
  PaginationOptions;

export interface TableProps<TDataItem> {
  style: React.CSSProperties;
  onUpdate: (
    current: number,
    pageSize: number
  ) => Promise<TableDataAndPagination<TDataItem>>;
  columns: Column<TDataItem>[];
  theme?: TableTheme;
  checkable?: boolean;
}
