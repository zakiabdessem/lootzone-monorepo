"use client";

// Workaround for ApexCharts SSR
// https://github.com/apexcharts/react-apexcharts/issues/469

import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function ApexChart(props: { type: any }) {
  const [Chart, setChart] = useState<typeof ReactApexChart>();
  const hasType = typeof props?.type !== "undefined";

  useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setChart(() => mod.default);
    });
  }, []);

  return hasType && Chart && <Chart {...props} />;
}
