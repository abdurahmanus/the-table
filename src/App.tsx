import React from "react";
import { Table, defaultTheme, TableTheme, Column } from "./Table";
import * as api from "./api";

const theme: TableTheme = { ...defaultTheme, "--row-height": 30 };

const columns: Column<api.MockData>[] = [
  { title: "Id", key: "id", dataIndex: "id", width: 70 },
  { title: "Update data", key: "date", dataIndex: "date", width: 150 },
  { title: "Message", key: "message", dataIndex: "message" },
];

export default function App() {
  return (
    <div>
      <Table
        style={{ height: "50vh" }}
        theme={theme}
        columns={columns}
        onUpdate={api.fetchData}
        checkable
      />
    </div>
  );
}
