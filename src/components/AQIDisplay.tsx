import { AirQualityData, getAQICategory } from "@/services/airQualityService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AQIDisplayProps {
  data: AirQualityData;
}

export const AQIDisplay = ({ data }: AQIDisplayProps) => {
  const { label, color, description } = getAQICategory(data.aqi);

  return (
    <Card className="p-6 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Air Quality Index</h2>
          <span className="text-sm text-gray-500">
            Updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`text-5xl font-bold ${color} bg-opacity-20 p-4 rounded-full`}>
            {data.aqi}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{label}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={data.aqi} max={500} className={`h-2 ${color}`} />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0</span>
            <span>500</span>
          </div>
        </div>
      </div>
    </Card>
  );
};