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
import { Chart } from 'chart.js';
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardEmployee } from "@/types/DashboardValues";

interface BottomSummaryProps {
  data: DashboardEmployee | null;
}

const BottomSummary: React.FC<BottomSummaryProps> = ({ data }) => {

  const educationtValues = data ?  [
    data?.based_on_education?.education_1,
    data?.based_on_education?.education_2,
    data?.based_on_education?.education_3,
    data?.based_on_education?.education_4,
    data?.based_on_education?.education_5,
  ].map(val => val ?? 0)
  : [];

  // Calculate dynamic max (add padding of +10)
  const maxEducationValue = Math.max(...educationtValues, 0); // avoid -Infinity if array is empty
  const dynamicEducationMax = maxEducationValue + 10;

  const ageValues = data ?  [
          data?.based_on_age?.stage_1,
          data?.based_on_age?.stage_2,
          data?.based_on_age?.stage_3,
          data?.based_on_age?.stage_4,
          data?.based_on_age?.stage_5,
  ].map(val => val ?? 0)
  : [];

  // Calculate dynamic max (add padding of +10)
  const maxAgeValue = Math.max(...ageValues, 0); // avoid -Infinity if array is empty
  const dynamicAgeMax = maxAgeValue + 10; 

  const lokalValues = data ?  [
    data?.based_on_lokal?.lokal,
    data?.based_on_lokal?.non_lokal, 
  ].map(val => val ?? 0)
  : [];

  // Calculate dynamic max (add padding of +10)
  const maxLokalValue = Math.max(...lokalValues, 0); // avoid -Infinity if array is empty
  const dynamicLokalMax = maxLokalValue + 10; 

  const departmentValue = data ? [
      {
        label: "Engineering",
        data: [data?.based_on_department?.engineering ?? 0],
        backgroundColor: "#FF6384",
      },
      {
        label: "Finance",
        data: [data?.based_on_department?.finance ?? 0],
        backgroundColor: "#36A2EB",
      },
      {
        label: "HRGA",
        data: [data?.based_on_department?.hrga ?? 0],
        backgroundColor: "#FFCE56",
      },
      {
        label: "Operation",
        data: [data?.based_on_department?.operation ?? 0],
        backgroundColor: "#4BC0C0",
      },
      {
        label: "Plant",
        data: [data?.based_on_department?.plant ?? 0],
        backgroundColor: "#9966FF",
      },
      {
        label: "SHE",
        data: [data?.based_on_department?.she ?? 0],
        backgroundColor: "#FF9F40",
      },
      {
        label: "Coal Loading",
        data: [data?.based_on_department?.coal_loading ?? 0],
        backgroundColor: "#B0BEC5",
      },
      {
        label: "Stockpile",
        data: [data?.based_on_department?.stockpile ?? 0],
        backgroundColor: "#90A4AE",
      },
      {
        label: "Shipping",
        data: [data?.based_on_department?.shipping ?? 0],
        backgroundColor: "#78909C",
      },
      {
        label: "Plant & Logistic",
        data: [data?.based_on_department?.plant_logistic ?? 0],
        backgroundColor: "#607D8B",
      },
      {
        label: "Keamanan & Eksternal",
        data: [data?.based_on_department?.keamanan_eksternal ?? 0],
        backgroundColor: "#E91E63", // Pink
      },
      {
        label: "OSHE (Operation & SHE)",
        data: [data?.based_on_department?.oshe ?? 0],
        backgroundColor: "#00BCD4", // Cyan
      },
      {
        label: "Management",
        data: [data?.based_on_department?.management ?? 0],
        backgroundColor: "#CDDC39", // Lime
      },
    ]
  : [];

  // ✅ Extract just the numbers from the dataset to compute max
  const rawValues = departmentValue.map(item => item.data[0] ?? 0);

  // ✅ Calculate dynamic max
  const maxDepartmentValue = Math.max(...rawValues, 0); // avoid -Infinity
  const dynamicDepartmentMax = maxDepartmentValue + 20;
  
  // ✅ Register Chart.js components and plugins
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels
  );

  // ✅ Shadow plugin for depth effect
  const shadowPlugin = {
    id: 'shadowPlugin',
    beforeDatasetDraw: (chart: Chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    },
    afterDatasetDraw: (chart: Chart) => {
      chart.ctx.restore();
    },
  };

  // ✅ Bar chart options (horizontal)
  const barOptionsDepartment: ChartOptions<"bar"> = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "right",
        formatter: Math.round,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: dynamicEducationMax, // ✅ Set the scale to 20
      },
    },
  };

    // ✅ Bar chart options (horizontal)
  const barOptionsLokal: ChartOptions<"bar"> = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "right",
        formatter: Math.round,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: dynamicLokalMax, // ✅ Set the scale to 20
      },
    },
  };

    // ✅ Bar chart options (horizontal)
  const barOptionsAge: ChartOptions<"bar"> = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "right",
        formatter: Math.round,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: dynamicAgeMax, // ✅ Set the scale to 20
      },
    },
  };

  // ✅ Bar chart options (vertical)
  const barOptionsVertical: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { 
        display: true,
        position: "bottom" // or "bottom"
      }, // ✅ show legends (dataset labels)
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: Math.round,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    scales: { 
      y: {
        beginAtZero: true,
        max: dynamicDepartmentMax, // ✅ Set the scale to 20
      },
    },
  };

  // ✅ Pie chart options
  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 20, padding: 15 },
      },
      datalabels: {
        formatter: (value: number) => value,
        color: "#000",
        font: { weight: "bold" },
      },
    },
    radius: '90%',
  };

  // ✅ Chart data definitions
  const ageData = data ? {
    labels: ["18-27", "28-37", "38-47", "48-57", "58-67"],
    datasets: [
      {
        label: "Jumlah",
        data: ageValues,
        backgroundColor: "#ff7f0e",
        borderRadius: 10,
      },
    ],
  } : { labels: [], datasets: [] };

   // ✅ Chart data definitions
  const lokalData = data ? {
    labels: ["Lokal", "Non Lokal"],
    datasets: [
      {
        label: "Jumlah",
        data: lokalValues,
        backgroundColor: "#ff7f0e",
        borderRadius: 10,
      },
    ],
  } : { labels: [], datasets: [] };

  const serviceYearsData = data ? {
    labels: ["0-6 Bulan", "6-12 Bulan", "Lebih Dari 1 Tahun", "Lebih Dari 2 Tahun"],
    datasets: [
      {
        label: "Jumlah",
        data: [
          data?.based_on_year?.year_1,
          data?.based_on_year?.year_2,
          data?.based_on_year?.year_3,
          data?.based_on_year?.year_4,
        ],
        backgroundColor: ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"],
        borderWidth: 1,
      },
    ],
  } : { labels: [], datasets: [] };

  const educationData = data ? {
    labels: ["SD", "SLTP", "SLTA/Sederajat", "Diploma", "Sarjana"],
    datasets: [
      {
        label: "Jumlah",
        data: educationtValues,
        backgroundColor: "#8884d8",
        borderRadius: 10,
      },
    ],
  } : { labels: [], datasets: [] };

  const departmentData = data ? {
    labels: [""], // One label on the x-axis
    datasets: departmentValue,
  } : { labels: [""], datasets: [] };

  const ringData = data ? {
    labels: ["Ring I", "Ring II", "RING III", "LUAR RING"],
    datasets: [
      {
        label: "Jumlah",
        data: [
          data?.based_on_ring?.ring_1,
          data?.based_on_ring?.ring_2,
          data?.based_on_ring?.ring_3,
          data?.based_on_ring?.luar_ring,
        ],
        backgroundColor: ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"],
        borderWidth: 1,
      },
    ],
  } : { labels: [], datasets: [] };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      <div>
        <h2 className="text-center font-bold mb-2">Based on Ages</h2>
        <Bar data={ageData} options={barOptionsAge} plugins={[shadowPlugin, ChartDataLabels]} />
      </div>

      <div>
        <h2 className="text-center font-bold mb-2">Based on Service Years</h2>
        <div className="relative w-full h-[300px] flex justify-center items-start">
          <Pie data={serviceYearsData} options={pieOptions} plugins={[shadowPlugin, ChartDataLabels]} />
        </div>
      </div>

      <div>
        <h2 className="text-center font-bold mb-2">Based on Ring</h2>
        <div className="relative w-full h-[300px] flex justify-center items-start">
          <Pie data={ringData} options={pieOptions} plugins={[shadowPlugin, ChartDataLabels]} />
        </div>
      </div>

      <div>
        <h2 className="text-center font-bold mb-2">Based on Education</h2>
        <Bar data={educationData} options={barOptionsDepartment} plugins={[shadowPlugin, ChartDataLabels]} />
      </div>

      <div>
        <h2 className="text-center font-bold mb-2">Based on Department</h2>
        <Bar data={departmentData} options={barOptionsVertical} plugins={[shadowPlugin, ChartDataLabels]} />
      </div>

      <div>
        <h2 className="text-center font-bold mb-2">Based on Kategori Lokal/Non Lokal</h2>
        <Bar data={lokalData} options={barOptionsLokal} plugins={[shadowPlugin, ChartDataLabels]} />
      </div>
    </div>
  );
};

export default BottomSummary;
