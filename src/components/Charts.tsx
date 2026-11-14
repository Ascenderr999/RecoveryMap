import { localize } from "../i18n";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";
import { matchedTrend } from "../lib/calculations";
import type { Assessment, Session } from "../types";
import { adherence } from "../lib/calculations";
const grid = "#24394e",
  muted = "#9aafc4";
const tooltip = {
  background: "#101d2d",
  border: "1px solid #36516a",
  borderRadius: 10,
  color: "#f4f7fb",
};
export function TrajectoryChart({
  rows,
  gap = false,
}: {
  rows: Assessment[];
  gap?: boolean;
}) {
  const data = matchedTrend(rows);
  if (!data.length)
    return (
      <p>{localize("No same-date strength and mobility pairs available.")}</p>
    );
  return (
    <div
      className="chart"
      role="img"
      aria-label={localize(
        gap
          ? "Recovery Gap over matched assessment dates, in percentage points"
          : "Strength and mobility relative to baseline over matched assessment dates",
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 14, right: 14, bottom: 10, left: 0 }}
        >
          <defs>
            <linearGradient
              id={gap ? "gap-fill" : "strength-fill"}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#42e4ed" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#42e4ed" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!gap && (
            <Area
              isAnimationActive={false}
              type="linear"
              dataKey="strength"
              fill="url(#strength-fill)"
              stroke="none"
              legendType="none"
              tooltipType="none"
            />
          )}
          <CartesianGrid stroke={grid} vertical={false} strokeDasharray="3 5" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => v.slice(5)}
            stroke={muted}
            fontSize={11}
            tickMargin={12}
          />
          <YAxis
            stroke={muted}
            fontSize={11}
            unit={gap ? localize(" pp") : "%"}
            domain={gap ? ["auto", "auto"] : [0, 120]}
            width={58}
          />
          <Tooltip
            contentStyle={tooltip}
            formatter={(v) => [`${Number(v).toFixed(1)} ${gap ? localize("pp") : "%"}`]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          />
          <ReferenceLine
            y={gap ? 0 : 100}
            stroke="#63778b"
            strokeDasharray="5 5"
            label={localize({
              value: localize(gap ? "No difference" : "Baseline"),
              position: "insideTopRight",
              fill: muted,
              fontSize: 10,
            })}
          />
          {localize(
            gap ? (
              <Line
                isAnimationActive={false}
                name={localize("Descriptive gap")}
                type="linear"
                dataKey="gap"
                stroke="#f6bd69"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            ) : (
              <>
                <Line
                  isAnimationActive={false}
                  name={localize("Measured strength")}
                  type="linear"
                  dataKey="strength"
                  stroke="#42e4ed"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  isAnimationActive={false}
                  name={localize("Functional mobility")}
                  type="linear"
                  dataKey="mobility"
                  stroke="#ffb355"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </>
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
export function AdherenceChart({
  sessions,
  day,
}: {
  sessions: Session[];
  day: number;
}) {
  const data = Array.from({ length: day }, (_, i) => ({
    day: `D${i + 1}`,
    adherence: adherence(
      sessions.filter((s) => s.day === i + 1),
      day,
    ).percent,
  }));
  return (
    <div
      className="chart short"
      role="img"
      aria-label={localize("Daily session adherence percent")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={grid} vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="day" stroke={muted} fontSize={10} />
          <YAxis unit="%" domain={[0, 100]} stroke={muted} fontSize={10} />
          <Tooltip
            contentStyle={tooltip}
            formatter={(v) => `${Number(v).toFixed(0)}%`}
          />
          <Bar
            isAnimationActive={false}
            name={localize("Completed / scheduled")}
            dataKey="adherence"
            fill="#42e4ed"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
