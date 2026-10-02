"use client";

import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";

const evolutionValues = [
  2380, 2410, 2465, 2430, 2510, 2580, 2540, 2635, 2690, 2610, 2730, 2675,
  2760, 2810, 2775, 2860, 2920, 2885, 2970, 3015, 2960, 3060, 3110, 3040,
  3135, 3190, 3150, 3260, 3310, 3245, 3350, 3390, 3325, 3440, 3480, 3410,
  3520, 3570, 3495, 3610, 3660, 3590, 3710, 3760, 3690, 3810, 3860, 3785,
  3880, 3940, 3860, 3990, 4040, 3960, 4090, 4130, 4050, 4190, 4230, 4160,
];

const distributionValues = [18, 44, 86, 138, 205, 274, 318, 289, 226, 171, 116, 73, 42, 23];

function buildOption(variant: "line" | "bar"): EChartsOption {
  const common: EChartsOption = {
    animationDuration: 450,
    color: ["#000091", "#E1000F", "#18753C", "#A558A0"],
    textStyle: {
      fontFamily: "Marianne, Arial, sans-serif",
      fontWeight: 400,
      color: "#161616",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#777777",
      borderWidth: 1,
      padding: 12,
      textStyle: {
        color: "#161616",
        fontFamily: "Marianne, Arial, sans-serif",
        fontWeight: 400,
        fontSize: 12,
      },
    },
  };

  if (variant === "line") {
    return {
      ...common,
      grid: { left: 8, right: 12, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        ...common.tooltip,
        trigger: "axis",
        valueFormatter: (value) => `${Number(value).toLocaleString("fr-FR")} €`,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: evolutionValues.map((_, index) => `${2022 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`),
        axisLine: { lineStyle: { color: "#E5E5E5" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#666",
          fontSize: 10,
          formatter: (_value: string, index: number) => index === 0 ? "2022" : index === evolutionValues.length - 1 ? "2026" : "",
        },
      },
      yAxis: {
        type: "value",
        min: 2000,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#666666", fontSize: 10, formatter: (value: number) => `${value} €` },
        splitLine: { lineStyle: { color: "#E5E5E5", type: "dashed" } },
      },
      series: [{
        type: "line",
        data: evolutionValues,
        smooth: true,
        symbol: "none",
        showSymbol: false,
        lineStyle: { color: "#000091", width: 2 },
        itemStyle: { color: "#000091" },
        emphasis: { focus: "series" },
      }],
    };
  }

  return {
    ...common,
    grid: { left: 8, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      ...common.tooltip,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${Number(value).toLocaleString("fr-FR")} ventes`,
    },
    xAxis: {
      type: "category",
      data: distributionValues.map((_, index) => 500 + index * 750),
      axisLine: { lineStyle: { color: "#E5E5E5" } },
      axisTick: { show: false },
      axisLabel: {
        color: "#666",
        fontSize: 10,
        formatter: (_value: string, index: number) => index === 0 ? "500 €" : index === distributionValues.length - 1 ? "10 000 €" : "",
      },
    },
    yAxis: { type: "value", axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { lineStyle: { color: "#E5E5E5", type: "dashed" } } },
    series: [{
      type: "bar",
      data: distributionValues,
      barCategoryGap: "12%",
      itemStyle: { color: "#000091" },
      emphasis: { focus: "series", itemStyle: { color: "#1212ff" } },
    }],
  };
}

export default function DvfChart({ variant, height = 104 }: { variant: "line" | "bar"; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let chart: import("echarts").ECharts | undefined;

    async function renderChart() {
      if (!containerRef.current) return;
      const echarts = await import("echarts");
      if (disposed || !containerRef.current) return;

      chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
      chart.setOption(buildOption(variant));
      observer = new ResizeObserver(() => chart?.resize());
      observer.observe(containerRef.current);
    }

    void renderChart();
    return () => {
      disposed = true;
      observer?.disconnect();
      chart?.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className="mt-2 w-full"
      style={{ height }}
      role="img"
      aria-label={variant === "line" ? "Évolution du prix de vente médian au mètre carré" : "Distribution du prix de vente au mètre carré"}
    />
  );
}
