const mockData = require("./MOCK_DATA.json");

export interface MockData {
  id: number;
  date: string;
  message: string;
}

export interface FetchDataResult {
  items: MockData[];
  total: number;
  current: number;
  pageSize: number;
}

export function fetchData(
  current = 1,
  pageSize = 10
): Promise<FetchDataResult> {
  console.log("fetch data", { current, pageSize });

  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          items: mockData.slice((current - 1) * pageSize, current * pageSize),
          total: mockData.length,
          current,
          pageSize,
        }),
      Math.random() * 500
    );
  });
}
