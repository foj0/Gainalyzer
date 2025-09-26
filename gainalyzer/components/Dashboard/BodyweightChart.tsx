import { useCallback, useEffect, useState } from "react";
import { ResponsiveContainer, Legend, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, TooltipProps, TooltipContentProps } from "recharts";
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
    bwDomain: { bwMin: number; bwMax: number };
    calDomain: { calMin: number; calMax: number };
    yTickCount: number;
}

export default function BodyweightChart({ logs }: { logs: any[] }) {
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "180d" | "365d" | "all">("30d");
    const [bwDomain, setBwDomain] = useState<{ bwMin: number, bwMax: number }>({ bwMin: 100, bwMax: 200 })
    const [calDomain, setCalDomain] = useState<{ calMin: number, calMax: number }>({ calMin: 100, calMax: 200 })
    const [yTickCount, setYTickCount] = useState<number>(4);
    const [xTicks, setXTicks] = useState<string[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any>(null); // only logs within our selected dateRange
    const [preparedLogs, setPreparedLogs] = useState<Log[]>([]); // logs prepared for chart, missing dates are filled in with null values
    const [isMobile, setIsMobile] = useState(false);

    // Check if windowsize is mobile size on mount and resize
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const handleResize = () => setIsMobile(window.innerWidth < 640);

        // on window resize, after stopped resizing for 100ms call handleResize. So we don't spam it.
        const debouncedResize = () => {
            clearTimeout(timer);          // cancel previous pending call
            timer = setTimeout(handleResize, 100); // schedule new call
        };

        window.addEventListener("resize", debouncedResize);

        // call once immediately on mount
        handleResize();

        // cleanup
        return () => {
            window.removeEventListener("resize", debouncedResize);
            clearTimeout(timer);
        };
    }, []);

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
            const cals = filteredLogs.map((l) => l.calories).filter(Boolean) as number[];
            let paddedBwMin = 0;
            let paddedBwMax = 0;
            let paddedCalMin = 0;
            let paddedCalMax = 0;
            let tickCount = 4; // default value 4

            if (weights.length) {
                const minWeight = Math.min(...weights);
                const maxWeight = Math.max(...weights);
                const minCals = Math.min(...cals);
                const maxCals = Math.max(...cals);

                paddedBwMin = Math.floor(minWeight / 5) * 5 - 5; // round to the nearest increment of 5 then add 5 padding
                paddedBwMax = Math.ceil(maxWeight / 5) * 5 + 5;
                paddedCalMin = Math.floor(minCals / 50) * 50 - 500; // round to the nearest 50 cals then add 500 padding
                paddedCalMax = Math.floor(maxCals / 50) * 50 + 500;

                const yRange = paddedBwMax - paddedBwMin;
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
            console.log("ismobile?", isMobile)
            let intervalDays = 1;
            if (range === "7d") intervalDays = 1;
            else if (range === "30d") intervalDays = 7;
            // less ticks on mobile so it doesn't look cluttered
            else if (range === "90d") intervalDays = isMobile ? 14 : 7;
            else if (range === "180d") intervalDays = isMobile ? 30 : 14;
            else if (range === "365d") intervalDays = isMobile ? 60 : 30;
            else if (range === "all") {
                const totalDays = Math.ceil(
                    (today.getTime() - new Date(filteredLogs[0].log_date).getTime()) / (1000 * 60 * 60 * 24)
                );
                const maxTicks = isMobile ? 8 : 12; // limit ticks so we don't get too many
                intervalDays = Math.ceil(totalDays / maxTicks); // spread ticks evenly
            }

            const xTicks: string[] = [];
            const tickCursor = new Date(startDate);
            while (tickCursor <= today) {
                xTicks.push(tickCursor.toISOString().split("T")[0]);
                tickCursor.setDate(tickCursor.getDate() + intervalDays);
            }

            return { filledLogs, xTicks, bwDomain: { bwMin: paddedBwMin, bwMax: paddedBwMax }, calDomain: { calMin: paddedCalMin, calMax: paddedCalMax }, yTickCount: tickCount };
        },
        []
    );

    // 🔄 recompute whenever logs or dateRange changes
    useEffect(() => {
        const chartData = prepareChartData(logs, dateRange);
        setPreparedLogs(chartData.filledLogs);
        setXTicks(chartData.xTicks);
        setBwDomain(chartData.bwDomain);
        setCalDomain(chartData.calDomain);
        setYTickCount(chartData.yTickCount);
    }, [logs, dateRange, prepareChartData]);

    const unitMap: Record<string, string> = {
        bodyweight: "lbs",
        calories: "kcal",
        reps: "reps",
    };

    function CustomTooltip<ValueType extends string | number = number, NameType extends string = string>(
        { active, payload, label }: TooltipContentProps<ValueType, NameType>
    ) {
        // active is true since we're hovering over a point
        // payload is an array of obj representing the data at that point
        // label is the x axis value
        if (active && payload && payload.length) {
            return (
                // Displays:
                // Date:
                // Value1, Unit1
                // Value2, Unit2
                // ...
                <div className="">
                    <p className="">{label}</p>
                    {payload.map((entry, idx) => {
                        const { value, dataKey, color } = entry;
                        const unit = unitMap[dataKey as string] ?? "";

                        return (
                            // style={{color}} uses stroke line color
                            <p key={idx}>
                                {value} {unit}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    }

    return (
        <div className="dashboard-section-1 rounded-lg shadow w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold m-2">Bodyweight & Calories</h2>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm m-2"
                >
                    <option value="7d">1 Week</option>
                    <option value="30d">1 Month</option>
                    <option value="90d">3 Months</option>
                    <option value="180d">6 Months</option>
                    <option value="365d">1 Year</option>
                    <option value="all">All</option>
                </select>
            </div>


            <ResponsiveContainer width="100%" height={isMobile ? 200 : 450}>
                <LineChart
                    data={preparedLogs}
                    margin={{ top: 5, right: 0, left: 0, bottom: 10 }}
                >
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
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        tickMargin={isMobile ? 10 : 20}
                        padding={isMobile ? { left: 10 } : { left: 20 }}
                    />
                    <YAxis
                        domain={[bwDomain.bwMin, bwDomain.bwMax]}
                        tickCount={yTickCount}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        yAxisId="left"
                    />
                    <YAxis
                        domain={[calDomain.calMin, calDomain.calMax]}
                        tickCount={yTickCount}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        yAxisId="right"
                        orientation="right"
                    />
                    <Tooltip
                        labelFormatter={(dateStr) => {
                            const d = new Date(dateStr);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        content={CustomTooltip}
                    />

                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        content={(props) => {
                            const { payload } = props;
                            return (
                                <div className="flex justify-center flex-wrap gap-2 mt-5">
                                    {payload?.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                            {/* Colored icon */}
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: entry.color }} // dynamic color
                                            />
                                            {/* Label */}
                                            <span className="text-gray-700">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="bodyweight" stroke="green" strokeWidth={3} dot={{ r: 1 }} connectNulls />
                    <Line yAxisId="right" type="monotone" dataKey="calories" stroke="blue" strokeWidth={3} dot={{ r: 1 }} connectNulls />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
