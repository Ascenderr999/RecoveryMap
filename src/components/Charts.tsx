import {
  ResponsiveContainer,
  LineChart,
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
    return <p>No same-date strength and mobility pairs available.</p>;
  return (
    <div
      className="chart"
      role="img"
      aria-label={
        gap
          ? "Recovery Gap over matched assessment dates, in percentage points"
          : "Strength and mobility relative to baseline over matched assessment dates"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 14, right: 14, bottom: 10, left: 0 }}
        >
          <CartesianGrid stroke={grid} vertical={false} />
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
            unit={gap ? " pp" : "%"}
            domain={gap ? ["auto", "auto"] : [0, 120]}
            width={58}
          />
          <Tooltip
            contentStyle={tooltip}
            formatter={(v) => [`${Number(v).toFixed(1)} ${gap ? "pp" : "%"}`]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          />
          <ReferenceLine
            y={gap ? 0 : 100}
            stroke="#63778b"
            strokeDasharray="5 5"
            label={{
              value: gap ? "No difference" : "Baseline",
              position: "insideTopRight",
              fill: muted,
              fontSize: 10,
            }}
          />
          {gap ? (
            <Line
              isAnimationActive={false}
              name="Descriptive gap"
              type="monotone"
              dataKey="gap"
              stroke="#f6bd69"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          ) : (
            <>
              <Line
                isAnimationActive={false}
                name="Measured strength"
                type="monotone"
                dataKey="strength"
                stroke="#73e4d2"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                isAnimationActive={false}
                name="Functional mobility"
                type="monotone"
                dataKey="mobility"
                stroke="#95a5ff"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </>
          )}
        </LineChart>
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
      aria-label="Daily session adherence percent"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="day" stroke={muted} fontSize={10} />
          <YAxis unit="%" domain={[0, 100]} stroke={muted} fontSize={10} />
          <Tooltip
            contentStyle={tooltip}
            formatter={(v) => `${Number(v).toFixed(0)}%`}
          />
          <Bar
            isAnimationActive={false}
            name="Completed / scheduled"
            dataKey="adherence"
            fill="#73e4d2"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
