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
import { DashboardEmployeeKontrak } from "@/types/DashboardValues";

interface BottomSummaryProps {
  data: DashboardEmployeeKontrak | null;
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
    month?.operation ?? 0,
    month?.plant ?? 0,
    month?.hrga ?? 0,
    month?.she ?? 0,
    month?.finance ?? 0,
    month?.engineering ?? 0,
    month?.coal_loading ?? 0,
    month?.stockpile ?? 0,
    month?.shipping ?? 0,
    month?.plant_logistic ?? 0,
    month?.keamanan_eksternal ?? 0,
    month?.oshe ?? 0,
    month?.management ?? 0,
  ]); 

  const dynamicMaxValue = Math.max(...departmentValues, 0) + 5;

  const departmentValue = [
  {
    label: "Operation",
    data: allMonthData.map((month) => month?.operation ?? 0),
    backgroundColor: "#4CAF50", // Green
  },
  {
    label: "Plant",
    data: allMonthData.map((month) => month?.plant ?? 0),
    backgroundColor: "#FF9800", // Orange
  },
  {
    label: "HRGA",
    data: allMonthData.map((month) => month?.hrga ?? 0),
    backgroundColor: "#2196F3", // Blue
  },
  {
    label: "SHE",
    data: allMonthData.map((month) => month?.she ?? 0),
    backgroundColor: "#F44336", // Red
  },
  {
    label: "Finance",
    data: allMonthData.map((month) => month?.finance ?? 0),
    backgroundColor: "#9C27B0", // Purple
  },
  {
    label: "Engineering",
    data: allMonthData.map((month) => month?.engineering ?? 0),
    backgroundColor: "#3F51B5", // Indigo
  },
  {
    label: "Coal Loading",
    data: allMonthData.map((month) => month?.coal_loading ?? 0),
    backgroundColor: "#795548", // Brown
  },
  {
    label: "Stockpile",
    data: allMonthData.map((month) => month?.stockpile ?? 0),
    backgroundColor: "#FFC107", // Amber
  },
  {
    label: "Shipping",
    data: allMonthData.map((month) => month?.shipping ?? 0),
    backgroundColor: "#009688", // Teal
  },
  {
    label: "Plant & Logistic",
    data: allMonthData.map((month) => month?.plant_logistic ?? 0),
    backgroundColor: "#607D8B", // Blue Grey
  },
  {
    label: "Keamanan & Eksternal",
    data: allMonthData.map((month) => month?.keamanan_eksternal ?? 0),
    backgroundColor: "#E91E63", // Pink
  },
  {
    label: "OSHE (Operation & SHE)",
    data: allMonthData.map((month) => month?.oshe ?? 0),
    backgroundColor: "#00BCD4", // Cyan
  },
  {
    label: "Management",
    data: allMonthData.map((month) => month?.management ?? 0),
    backgroundColor: "#CDDC39", // Lime
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
