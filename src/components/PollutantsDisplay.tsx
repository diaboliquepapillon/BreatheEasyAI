import { AirQualityData } from "@/services/airQualityService";
import { Card } from "@/components/ui/card";
import { Wind, Droplets, Cloud } from "lucide-react";

interface PollutantsDisplayProps {
  data: AirQualityData;
}

export const PollutantsDisplay = ({ data }: PollutantsDisplayProps) => {
  const pollutants = [
    { name: "PM2.5", value: data.pm25, icon: <Droplets className="w-6 h-6" />, unit: "μg/m³" },
    { name: "PM10", value: data.pm10, icon: <Cloud className="w-6 h-6" />, unit: "μg/m³" },
    { name: "NO₂", value: data.no2, icon: <Wind className="w-6 h-6" />, unit: "ppb" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {pollutants.map((pollutant) => (
        <Card key={pollutant.name} className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {pollutant.icon}
            </div>
            <div>
              <h3 className="font-semibold">{pollutant.name}</h3>
              <p className="text-2xl font-bold">
                {pollutant.value} <span className="text-sm text-gray-500">{pollutant.unit}</span>
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};