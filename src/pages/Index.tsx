import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AQIDisplay } from "@/components/AQIDisplay";
import { PollutantsDisplay } from "@/components/PollutantsDisplay";
import { TrendChart } from "@/components/TrendChart";
import { AQIMap } from "@/components/AQIMap";
import { getAirQuality } from "@/services/airQualityService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchLocation
        )}&key=YOUR_OPENCAGE_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng: lon } = data.results[0].geometry;
        setLocation({ lat, lon });
        toast.success("Location found! Checking air quality...");
      } else {
        toast.error("Location not found. Please try again.");
      }
    } catch (error) {
      toast.error("Couldn't find this location. Please try again.");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["airQuality", location?.lat, location?.lon],
    queryFn: () => (location ? getAirQuality(location.lat, location.lon) : null),
    enabled: !!location,
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">How's the Air Quality?</h1>
        <p className="text-gray-600">
          Just type in any location to check how clean the air is there! 🌍
        </p>
        
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            placeholder="Enter a location (e.g., London, New York, Tokyo)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
          />
          <Button onClick={handleLocationSearch}>Check Air</Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking air quality...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-xl text-red-500">Oops! Something went wrong</p>
          <p className="mt-2 text-gray-600">Please try searching for a different location</p>
        </div>
      )}

      {data && location && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AQIDisplay data={data} />
            <PollutantsDisplay data={data} />
          </div>
          <div>
            <AQIMap data={data} location={location} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;