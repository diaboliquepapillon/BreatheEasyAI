import { AirQualityData, getAQICategory } from "@/services/airQualityService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Smile, Frown, Meh, AlertTriangle, AlertOctagon } from "lucide-react";

interface AQIDisplayProps {
  data: AirQualityData;
}

export const AQIDisplay = ({ data }: AQIDisplayProps) => {
  const { label, color, description } = getAQICategory(data.aqi);
  const formattedDate = format(new Date(data.timestamp), "PPpp");

  const getEmoji = (aqi: number) => {
    if (aqi <= 50) return <Smile className="w-8 h-8 text-green-500" />;
    if (aqi <= 100) return <Meh className="w-8 h-8 text-yellow-500" />;
    if (aqi <= 150) return <Frown className="w-8 h-8 text-orange-500" />;
    if (aqi <= 200) return <AlertTriangle className="w-8 h-8 text-red-500" />;
    return <AlertOctagon className="w-8 h-8 text-purple-500" />;
  };

  return (
    <Card className="p-6 animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Air Quality Score
          </h2>
          <span className="text-sm text-gray-500">
            Updated: {formattedDate}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`text-5xl font-bold ${color} bg-opacity-20 p-4 rounded-full flex items-center gap-2`}>
            {data.aqi}
            {getEmoji(data.aqi)}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{label}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={data.aqi} max={500} className={`h-3 ${color}`} />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Perfect 😊</span>
            <span>Moderate 😐</span>
            <span>Bad 😷</span>
          </div>
        </div>
      </div>
    </Card>
  );
};