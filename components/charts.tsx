"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { accentHex, useShell } from "@/components/shell-context";
import { funnelSeries, revenueSeries, statusBreakdown } from "@/lib/mock";
import { formatBRL } from "@/lib/format";

function useChartTheme() {
  const { accent, theme } = useShell();
  const color = accentHex(accent, theme);
  const isDark = theme === "dark";
  return {
    accent: color,
    muted: isDark ? "#6d756f" : "#8a928c",
    grid: isDark ? "#2a302c" : "#e0e2dc",
    tick: { fill: isDark ? "#7a827c" : "#6d756f", fontSize: 11 },
    tooltip: {
      borderRadius: 4,
      border: `1px solid ${isDark ? "#2a302c" : "#e0e2dc"}`,
      background: isDark ? "#141816" : "#ffffff",
      color: isDark ? "#f1f3f1" : "#121411",
      fontSize: 12,
      boxShadow: "none",
    },
  };
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-[240px] w-full flex-1">{children}</div>;
}

export function RevenueChart() {
  const { accent, muted, grid, tick, tooltip } = useChartTheme();

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={revenueSeries}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillRecebido" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={tick}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={tick}
            width={36}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={tooltip}
            formatter={(v) => formatBRL(Number(v))}
          />
          <Area
            type="monotone"
            dataKey="recebido"
            name="Recebido"
            stroke={accent}
            fill="url(#fillRecebido)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="aberto"
            name="Em aberto"
            stroke={muted}
            fill="transparent"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function FunnelChart() {
  const { accent, grid, tick, tooltip } = useChartTheme();

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={funnelSeries}
          layout="vertical"
          margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="stage"
            tickLine={false}
            axisLine={false}
            tick={tick}
            width={72}
          />
          <Tooltip contentStyle={tooltip} />
          <Bar dataKey="value" name="Qtd" fill={accent} radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function StatusPieChart() {
  const { accent, tooltip } = useChartTheme();
  const data = statusBreakdown.map((entry, i) =>
    i === 0 ? { ...entry, color: accent } : entry,
  );

  return (
    <div className="mx-auto h-[180px] w-full max-w-[220px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltip} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
