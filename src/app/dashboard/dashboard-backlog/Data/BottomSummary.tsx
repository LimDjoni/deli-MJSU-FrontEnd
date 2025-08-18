"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
  Chart,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { DashboardBackLog } from "@/types/DashboardValues";
 
interface BottomSummaryProps {
  data: DashboardBackLog | null;
}
 
const BottomSummary: React.FC<BottomSummaryProps> = ({ data }) => {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);
 
  const allAgingTypes = data
  ? [
      data.aging_summary?.aging_total_1,
      data.aging_summary?.aging_total_2,
      data.aging_summary?.aging_total_3,
      data.aging_summary?.aging_total_4
    ]
  : [];
  
  // ✅ Flatten values to calculate dynamic max Y
  const agingValues = allAgingTypes.flatMap((aging) => [
    aging?.pending ?? 0,
    aging?.open ?? 0,
    aging?.closed ?? 0,
    aging?.cancelled ?? 0,
    aging?.rejected ?? 0,
  ]);

  const dynamicMaxValue = Math.max(...agingValues, 0) + 5;

  // ✅ Dataset
  const agingValue = [
    {
      label: "Pending",
      data: allAgingTypes.map((aging) => aging?.pending ?? 0),
      backgroundColor: "#e7000b",
    },
    {
      label: "Open",
      data: allAgingTypes.map((aging) => aging?.open ?? 0),
      backgroundColor: "#ff6900",
    },
    {
      label: "Closed",
      data: allAgingTypes.map((aging) => aging?.closed ?? 0),
      backgroundColor: "#00a63e",
    },
    {
      label: "Cancelled",
      data: allAgingTypes.map((aging) => aging?.cancelled ?? 0),
      backgroundColor: "#578bfd",
    },
    {
      label: "Rejected",
      data: allAgingTypes.map((aging) => aging?.rejected ?? 0),
      backgroundColor: "#ffdf20",
    },
  ];

  const agingData = {
    labels: [
      "0-5 Days", "6-15 Days", "16-30 Days", ">30 Days"
    ],
    datasets: agingValue,
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
   <div className="p-6 space-y-6">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:w-1/3">
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="flex flex-col justify-around h-full">
            <p className="text-gray-500 font-bold">Pending</p>
            <p className="text-9xl font-bold text-red-600">{data?.backlog_summary?.pending}</p>
            <p className="text-2xl text-red-600">
              {data?.backlog_summary?.pending != null
                ? ((data.backlog_summary.pending / data.total_backlog) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="flex flex-col justify-around h-full">
            <p className="text-gray-500 font-bold">Open</p>
            <p className="text-9xl font-bold text-orange-500">{data?.backlog_summary?.open}</p>
            <p className="text-2xl text-orange-500">
              {data?.backlog_summary?.open != null
                ? ((data.backlog_summary.open / data.total_backlog) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="flex flex-col justify-around h-full">
            <p className="text-gray-500 font-bold">Closed</p>
            <p className="text-9xl font-bold text-green-600">{data?.backlog_summary?.closed}</p>
            <p className="text-2xl text-green-600">
              {data?.backlog_summary?.closed != null
                ? ((data.backlog_summary.closed / data.total_backlog) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="flex flex-col justify-around h-full">
            <p className="text-gray-500 font-bold">Cancelled</p>
            <p className="text-9xl font-bold text-blue-600">{data?.backlog_summary?.cancelled}</p>
            <p className="text-2xl text-blue-600">
              {data?.backlog_summary?.cancelled != null
                ? ((data.backlog_summary.cancelled / data.total_backlog) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <div className="flex flex-col justify-around h-full">
            <p className="text-gray-500 font-bold">Rejected</p>
            <p className="text-9xl font-bold text-yellow-300">{data?.backlog_summary?.rejected}</p>
            <p className="text-yellow-300">
              {data?.backlog_summary?.rejected != null
                ? ((data.backlog_summary.rejected / data.total_backlog) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Right: Chart */}
      <div className="bg-white shadow rounded p-4 w-full lg:w-2/3 h-[70vh]"> 
        <Bar
          data={agingData}
          options={barOptionsVertical}
          plugins={[shadowPlugin, ChartDataLabels]}
        /> 
      </div>
    </div>
  </div> 
  );
};

export default BottomSummary;
