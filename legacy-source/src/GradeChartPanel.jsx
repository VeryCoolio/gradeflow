import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function SmallStat({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function formatChartDate(timestamp) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

export default function GradeChartPanel({
  chartStudent,
  chartData,
  startLabel,
  currentLabel,
  bufferLabel,
  entryCount,
}) {
  if (!chartStudent || !chartData.length) {
    return (
      <div className="placeholder-card">
        {chartStudent
          ? "Noch keine gespeicherten Stunden für diesen Verlauf."
          : "Kein Schüler ausgewählt."}
      </div>
    );
  }

  const isCompact = typeof window !== "undefined"
    ? window.matchMedia("(max-width: 720px)").matches
    : false;
  const allXTicks = [
    ...new Set(chartData.filter((point) => !point.isStart).map((point) => point.timestamp)),
  ];
  const tickStep = isCompact
    ? Math.max(1, Math.ceil(allXTicks.length / 4))
    : Math.max(1, Math.ceil(allXTicks.length / 6));
  const xTicks = allXTicks.filter(
    (tick, index) =>
      index === 0 || index === allXTicks.length - 1 || index % tickStep === 0
  );

  return (
    <div className="stack">
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: isCompact ? 8 : 20,
              left: isCompact ? -12 : 0,
              bottom: isCompact ? 44 : 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(32, 53, 74, 0.18)" />
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={["dataMin", "dataMax"]}
              ticks={xTicks}
              tickFormatter={formatChartDate}
              angle={isCompact ? -38 : -25}
              textAnchor="end"
              interval={0}
              height={isCompact ? 78 : 70}
              tick={{ fontSize: isCompact ? 11 : 12 }}
            />
            <YAxis
              type="number"
              domain={[1, 6]}
              reversed
              ticks={[1, 2, 3, 4, 5, 6]}
              tickFormatter={(v) => String(v)}
              width={isCompact ? 26 : 36}
              tick={{ fontSize: isCompact ? 11 : 12 }}
            />
            <Tooltip
              formatter={(_value, _name, item) => [
                item.payload.isStart ? `Start bei ${item.payload.label}` : item.payload.label,
                "Note",
              ]}
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.timestamp
                  ? `Datum: ${formatChartDate(payload[0].payload.timestamp)}`
                  : "Datum"
              }
            />
            <ReferenceLine y={2} stroke="#d98952" strokeDasharray="4 4" />
            <Line
              type="linear"
              dataKey="grade"
              stroke="#2c7ec5"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid">
        <SmallStat label="Start" value={startLabel} />
        <SmallStat label="Aktuell" value={currentLabel} />
        <SmallStat label="Puffer" value={bufferLabel} />
        <SmallStat label="Einträge" value={entryCount} />
      </div>
    </div>
  );
}
