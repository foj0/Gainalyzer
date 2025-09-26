import { useCallback, useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, TooltipProps, TooltipContentProps } from "recharts";
import { chartDataReducer } from "recharts/types/state/chartDataSlice";

type Log = {
    log_date: string;
    bodyweight: number | null;
    calories: number | null;
    exercises?: any[];
};

interface ChartData {
    filledLogs: Log[];
    xTicks: string[];
    yDomain: { yMin: number; yMax: number };
    yTickCount: number;
}

export default function BodyweightChart({ logs }: { logs: any[] }) {
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "180d" | "365d" | "all">("30d");
    const [yDomain, setYDomain] = useState<{ yMin: number, yMax: number }>({ yMin: 100, yMax: 200 })
    const [yTickCount, setYTickCount] = useState<number>(4);
    const [xTicks, setXTicks] = useState<string[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any>(null);
    const [preparedLogs, setPreparedLogs] = useState<Log[]>([]);


    // ⬇️ helper to compute everything at once
    const prepareChartData = useCallback(
        (logs: Log[], range: typeof dateRange): ChartData => {
            const today = new Date();
            let startDate: Date;

            if (range === "all") {
                startDate = logs.length ? new Date(logs[0].log_date) : new Date();
            } else {
                startDate = new Date();
                const daysAgo = parseInt(range);
                startDate.setDate(today.getDate() - (daysAgo - 1));
            }

            // 1️⃣ filter logs within rdate arange
            const filteredLogs =
                range === "all"
                    ? logs
                    : logs.filter((l) => new Date(l.log_date) >= startDate);

            // 2️⃣ compute min/max for Y axis
            const weights = filteredLogs.map((l) => l.bodyweight).filter(Boolean) as number[];
            let paddedYMin = 0;
            let paddedYMax = 0;
            let tickCount = 4; // default value 4

            if (weights.length) {
                const minWeight = Math.min(...weights);
                const maxWeight = Math.max(...weights);

                paddedYMin = Math.floor(minWeight / 5) * 5 - 5;
                paddedYMax = Math.ceil(maxWeight / 5) * 5 + 5;

                const yRange = paddedYMax - paddedYMin;
                if (yRange <= 15) tickCount = 4;
                else if (yRange <= 30) tickCount = 6;
                else if (yRange <= 50) tickCount = 8;
                else tickCount = 10;
            }

            // 3️⃣ fill missing dates
            const logMap = new Map(filteredLogs.map((l) => [l.log_date, l]));
            const filledLogs: Log[] = [];
            const cursor = new Date(startDate);

            while (cursor <= today) {
                const dateStr = cursor.toISOString().split("T")[0];
                if (logMap.has(dateStr)) {
                    filledLogs.push(logMap.get(dateStr)!);
                } else {
                    filledLogs.push({ log_date: dateStr, bodyweight: null, calories: null });
                }
                cursor.setDate(cursor.getDate() + 1);
            }

            // 4️⃣ compute sparse X ticks
            let intervalDays = 1;
            if (range === "7d") intervalDays = 1;
            else if (range === "30d") intervalDays = 7;
            else if (range === "90d") intervalDays = 7;
            else if (range === "180d") intervalDays = 14;
            else if (range === "365d") intervalDays = 30;

            const xTicks: string[] = [];
            const tickCursor = new Date(startDate);
            while (tickCursor <= today) {
                xTicks.push(tickCursor.toISOString().split("T")[0]);
                tickCursor.setDate(tickCursor.getDate() + intervalDays);
            }

            return { filledLogs, xTicks, yDomain: { yMin: paddedYMin, yMax: paddedYMax }, yTickCount: tickCount };
        },
        []
    );

    // 🔄 recompute whenever logs or dateRange changes
    useEffect(() => {
        const chartData = prepareChartData(logs, dateRange);
        setPreparedLogs(chartData.filledLogs);
        setXTicks(chartData.xTicks);
        setYDomain(chartData.yDomain);
        setYTickCount(chartData.yTickCount);
    }, [logs, dateRange, prepareChartData]);

    const CustomTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
        // active is true since we're hovering over a point
        // payload is an array of obj representing the data at that point
        // label is the x axis value
        const isVisible = active && payload && payload.length;
        return (
            <div className="custom-tooltip" style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
                {isVisible && (
                    <>
                        {/* display date: weight */}
                        <p className="label">{`${label}:`}</p>
                        <p className="desc">{`${payload[0].value} lbs`}</p>
                    </>

                )}
            </div>
        );
    };

    return (
        <div className="dashboard-section-1 rounded-lg shadow p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Bodyweight</h2>

                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="7d">1 Week</option>
                    <option value="30d">1 Month</option>
                    <option value="90d">3 Months</option>
                    <option value="180d">6 Months</option>
                    <option value="365d">1 Year</option>
                    <option value="all">All</option>
                </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={preparedLogs}>
                    <CartesianGrid strokeDasharray="" stroke="#e5e7eb" strokeOpacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="log_date"
                        ticks={xTicks}
                        interval={0}
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(dateStr) => {
                            const d = new Date(dateStr);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                        domain={[yDomain.yMin, yDomain.yMax]}
                        tickCount={yTickCount}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                        labelFormatter={(dateStr) => {
                            const d = new Date(dateStr);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        content={CustomTooltip}
                    />
                    <Line type="monotone" dataKey="bodyweight" stroke="green" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
