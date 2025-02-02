import { AirQualityData, getAQICategory } from "@/services/airQualityService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Smile, Frown, Meh, AlertTriangle, AlertOctagon } from "lucide-react";

interface AQIDisplayProps {
  data: AirQualityData;
}

export const AQIDisplay = ({ data }: AQIDisplayProps) => {
  const { label, color, description, recommendation } = getAQICategory(data.aqi);
  const formattedDate = format(new Date(data.timestamp), "PPpp");

  const getEmoji = (aqi: number) => {
    if (aqi <= 50) return <Smile className="w-6 h-6 md:w-8 md:h-8 text-green-500" />;
    if (aqi <= 100) return <Meh className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />;
    if (aqi <= 150) return <Frown className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />;
    if (aqi <= 200) return <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />;
    return <AlertOctagon className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />;
  };

  return (
    <Card className="p-4 md:p-6 animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Air Quality Score
          </h2>
          <span className="text-xs md:text-sm text-gray-500">
            Updated: {formattedDate}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:space-x-4">
          <div className={`text-4xl md:text-5xl font-bold ${color} bg-opacity-20 p-3 md:p-4 rounded-full flex items-center gap-2 justify-center md:justify-start`}>
            {data.aqi}
            {getEmoji(data.aqi)}
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-semibold">{label}</h3>
            <p className="text-sm md:text-base text-gray-600">{description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={data.aqi} max={500} className={`h-2 md:h-3 ${color}`} />
          <div className="flex justify-between text-xs md:text-sm text-gray-500">
            <span>Brilliant 😊</span>
            <span>Fair 😐</span>
            <span>Poor 😷</span>
          </div>
        </div>

        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm md:text-base mb-2">Health Advisory</h4>
          <p className="text-xs md:text-sm text-gray-700">{recommendation}</p>
        </div>
      </div>
    </Card>
  );
};