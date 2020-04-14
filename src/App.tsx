import React from "react";
import { Table } from "./Table";
import * as api from "./api";

export default function App() {
  return (
    <div>
      <Table
        style={{ height: "50vh" }}
        onUpdate={(current, pageSize) => api.fetchData({ current, pageSize })}
      />
    </div>
  );
}
