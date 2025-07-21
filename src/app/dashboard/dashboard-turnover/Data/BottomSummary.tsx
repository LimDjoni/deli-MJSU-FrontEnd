"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Chart } from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { DashboardEmployeeTurnover } from "@/types/DashboardValues";

interface BottomSummaryProps {
  data: DashboardEmployeeTurnover | null;
}

const BottomSummary: React.FC<BottomSummaryProps> = ({ data }) => {
  // ✅ Register Chart.js components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels
  );

  // ✅ Extract monthly data
  const allMonthData = data
    ? [
        data.januari,
        data.februari,
        data.maret,
        data.april,
        data.mei,
        data.juni,
        data.juli,
        data.agustus,
        data.september,
        data.oktober,
        data.november,
        data.desember,
      ]
    : [];

  // ✅ Flatten values to calculate dynamic max Y
  const departmentValues = allMonthData.flatMap((month) => [
    month?.new_hire ?? 0,
    month?.berakhir_pkwt ?? 0,
    month?.resign ?? 0,
    month?.phk ?? 0,
  ]);

  const dynamicMaxValue = Math.max(...departmentValues, 0) + 5;

  // ✅ Dataset
  const departmentValue = [
    {
      label: "New Hire",
      data: allMonthData.map((month) => month?.new_hire ?? 0),
      backgroundColor: "#4CAF50",
    },
    {
      label: "Berakhir PKWT",
      data: allMonthData.map((month) => month?.berakhir_pkwt ?? 0),
      backgroundColor: "#FF9800",
    },
    {
      label: "Resign",
      data: allMonthData.map((month) => month?.resign ?? 0),
      backgroundColor: "#2196F3",
    },
    {
      label: "PHK",
      data: allMonthData.map((month) => month?.phk ?? 0),
      backgroundColor: "#F44336",
    },
  ];

  const departmentData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: departmentValue,
  };

  const shadowPlugin = {
    id: "shadowPlugin",
    beforeDatasetDraw: (chart: Chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    },
    afterDatasetDraw: (chart: Chart) => {
      chart.ctx.restore();
    },
  };

  const barOptionsVertical: ChartOptions<"bar"> = {
    responsive: true, 
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: Math.round,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
        max: dynamicMaxValue,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <div className="col-span-3 w-full h-[70vh] flex justify-center items-center"> {/* Center chart */}
        <div className="w-full h-full">
          <Bar
            data={departmentData}
            options={barOptionsVertical}
            plugins={[shadowPlugin, ChartDataLabels]}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomSummary;
