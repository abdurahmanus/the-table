import React from "react";
import { Table, defaultTheme, TableTheme } from "./Table";
import * as api from "./api";

const theme: TableTheme = { ...defaultTheme, "--row-height": 20 };

export default function App() {
  return (
    <div>
      <Table
        style={{ height: "50vh" }}
        theme={theme}
        onUpdate={api.fetchData}
      />
    </div>
  );
}
