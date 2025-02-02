import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIDisplay } from "@/components/AQIDisplay";
import { PollutantsDisplay } from "@/components/PollutantsDisplay";
import { TrendChart } from "@/components/TrendChart";
import { AQIMap } from "@/components/AQIMap";
import { getAirQuality, getHistoricalAirQuality } from "@/services/airQualityService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// TODO: Replace with your OpenCage API key
const OPENCAGE_API_KEY = "PLACE_YOUR_OPENCAGE_API_KEY_HERE";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchLocation
        )}&key=${OPENCAGE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng: lon } = data.results[0].geometry;
        setLocation({ lat, lon });
        toast.success(`Checking air quality in ${data.results[0].formatted}... 🌍`);
      } else {
        toast.error("Location not found. Please try again with a different search term.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Couldn't find this location. Please try again.");
    }
  };

  const { data: currentData, isLoading, error } = useQuery({
    queryKey: ["airQuality", location?.lat, location?.lon],
    queryFn: () => (location ? getAirQuality(location.lat, location.lon) : null),
    enabled: !!location,
  });

  const { data: historicalData } = useQuery({
    queryKey: ["historicalAirQuality", location?.lat, location?.lon],
    queryFn: () => (location ? getHistoricalAirQuality(location.lat, location.lon) : null),
    enabled: !!location,
  });

  const getBackgroundColor = (aqi?: number) => {
    if (!aqi) return "from-[#F2FCE2]";
    if (aqi <= 50) return "from-blue-100";
    if (aqi <= 100) return "from-yellow-100";
    if (aqi <= 150) return "from-orange-100";
    return "from-red-100";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBackgroundColor(currentData?.aqi)} to-white p-4 md:p-8 space-y-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Air Quality Monitor 🌍
          </h1>
          <p className="text-gray-600 text-center max-w-2xl">
            Enter a location to check real-time air quality data and get health recommendations
          </p>
          <div className="flex w-full max-w-md gap-2">
            <Input
              placeholder="Enter location (e.g., London, UK)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
            />
            <Button onClick={handleLocationSearch}>
              <Search className="mr-2" />
              Search
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">
            Loading air quality data... ⏳
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            Error loading air quality data. Please try again.
          </div>
        )}

        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AQIDisplay data={currentData} />
            <PollutantsDisplay data={currentData} />
          </div>
        )}

        {historicalData && historicalData.length > 0 && (
          <TrendChart data={historicalData} />
        )}

        {location && currentData && (
          <AQIMap data={currentData} location={location} />
        )}
      </div>
    </div>
  );
};

export default Index;