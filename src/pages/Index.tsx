import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIDisplay } from "@/components/AQIDisplay";
import { PollutantsDisplay } from "@/components/PollutantsDisplay";
import { TrendChart } from "@/components/TrendChart";
import { getAirQuality, AirQualityData } from "@/services/airQualityService";
import { toast } from "sonner";

const Index = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          toast.error("Could not get your location. Using default location.");
          setLocation({ lat: 51.5074, lon: -0.1278 }); // Default to London
        }
      );
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["airQuality", location?.lat, location?.lon],
    queryFn: () => location ? getAirQuality(location.lat, location.lon) : null,
    enabled: !!location,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Failed to load air quality data</p>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  // Mock data for the trend chart (in a real app, this would come from the API)
  const trendData: AirQualityData[] = Array.from({ length: 24 }, (_, i) => ({
    ...data,
    aqi: data.aqi + Math.random() * 20 - 10,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  })).reverse();

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Air Quality Monitor</h1>
      
      <AQIDisplay data={data} />
      
      <PollutantsDisplay data={data} />
      
      <TrendChart data={trendData} />
    </div>
  );
};

export default Index;