import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AirQualityData } from "@/services/airQualityService";

interface TrendChartProps {
  data: AirQualityData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  return (
    <Card className="p-6 h-[300px] animate-fade-in">
      <h2 className="text-xl font-bold mb-4">24-Hour Trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
            contentStyle={{ background: "white", border: "1px solid #ddd" }}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#2196F3"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};