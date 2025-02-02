import { AirQualityData } from "@/services/airQualityService";
import { Card } from "@/components/ui/card";
import { Wind, Droplets, Cloud } from "lucide-react";

interface PollutantsDisplayProps {
  data: AirQualityData;
}

export const PollutantsDisplay = ({ data }: PollutantsDisplayProps) => {
  const pollutants = [
    { 
      name: "PM2.5", 
      value: data.pm25, 
      icon: <Droplets className="w-5 h-5 md:w-6 md:h-6" />, 
      unit: "μg/m³",
      description: "Minuscule particles that can enter your lungs 🫁"
    },
    { 
      name: "PM10", 
      value: data.pm10, 
      icon: <Cloud className="w-5 h-5 md:w-6 md:h-6" />, 
      unit: "μg/m³",
      description: "Dust and smoke particles in the atmosphere 💨"
    },
    { 
      name: "NO₂", 
      value: data.no2, 
      icon: <Wind className="w-5 h-5 md:w-6 md:h-6" />, 
      unit: "ppb",
      description: "Gas from motor vehicles and factories 🚗"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 animate-fade-in">
      {pollutants.map((pollutant) => (
        <Card 
          key={pollutant.name} 
          className="p-3 md:p-4 hover:shadow-lg transition-shadow duration-300 cursor-help"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 md:p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
              {pollutant.icon}
            </div>
            <div>
              <h3 className="font-semibold text-base md:text-lg">{pollutant.name}</h3>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {pollutant.value}
                <span className="text-xs md:text-sm text-gray-500"> {pollutant.unit}</span>
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">{pollutant.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};