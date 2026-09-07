"use client";

import { useSyncExternalStore } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { subscribeTheme } from "@/lib/theme";
import { formatPrice } from "@/lib/utils";

interface PricePoint {
  timestamp: string | Date;
  price: number;
}

interface ChartColors {
  line: string;
  grid: string;
  axis: string;
  surface: string;
  ink: string;
}

const FALLBACK_COLORS: ChartColors = {
  line: "#f85e16",
  grid: "rgba(28,25,23,0.09)",
  axis: "#9c9189",
  surface: "#ffffff",
  ink: "#1c1917",
};

// Module-level cache so the snapshot stays referentially stable between
// renders. Cleared whenever the theme changes.
let colorCache: ChartColors | null = null;

function readColors(): ChartColors {
  if (colorCache) return colorCache;
  const s = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;

  colorCache = {
    line: pick("--color-brand-500", FALLBACK_COLORS.line),
    grid: pick("--line", FALLBACK_COLORS.grid),
    axis: pick("--ink-subtle", FALLBACK_COLORS.axis),
    surface: pick("--float-bg", FALLBACK_COLORS.surface),
    ink: pick("--ink", FALLBACK_COLORS.ink),
  };
  return colorCache;
}

function subscribeColors(onChange: () => void) {
  return subscribeTheme(() => {
    colorCache = null;
    onChange();
  });
}

/**
 * Recharts renders to SVG attributes rather than CSS classes, so it cannot
 * pick up the theme tokens on its own. Read the resolved values back off the
 * document, and re-read them whenever the theme changes.
 */
function useChartColors(): ChartColors {
  return useSyncExternalStore(
    subscribeColors,
    readColors,
    () => FALLBACK_COLORS
  );
}

export function PriceHistoryChart({ data }: { data: PricePoint[] }) {
  const colors = useChartColors();

  if (data.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-ink-subtle">
        Price history will appear here once we have tracked a change.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.timestamp), "MMM d"),
    price: d.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.line} stopOpacity={0.28} />
            <stop offset="100%" stopColor={colors.line} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: colors.axis }}
          stroke={colors.grid}
        />
        <YAxis
          tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: colors.axis }}
          stroke={colors.grid}
          width={58}
        />
        <Tooltip
          cursor={{ stroke: colors.line, strokeWidth: 1, strokeDasharray: "4 4" }}
          contentStyle={{
            background: colors.surface,
            border: `1px solid ${colors.grid}`,
            borderRadius: 14,
            color: colors.ink,
            fontSize: 12,
            boxShadow: "var(--shadow-2)",
          }}
          labelStyle={{ color: colors.axis }}
          formatter={(v) => [formatPrice(Number(v)), "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="none"
          fill="url(#priceFill)"
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={colors.line}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: colors.line }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
