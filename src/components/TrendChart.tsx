import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AirQualityData } from "@/services/airQualityService";

interface TrendChartProps {
  data: AirQualityData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  return (
    <Card className="p-3 md:p-6 h-[250px] md:h-[300px] animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Air Quality Timeline 📊
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            interval="preserveStartEnd"
            stroke="#666"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#666" tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
            contentStyle={{ 
              background: "white", 
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px",
              fontSize: "12px"
            }}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="url(#colorGradient)"
            strokeWidth={2}
            dot={false}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};