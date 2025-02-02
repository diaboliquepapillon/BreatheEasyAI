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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("opencage_api_key") || "");
  const [showApiInput, setShowApiInput] = useState(!localStorage.getItem("opencage_api_key"));

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("opencage_api_key", apiKey);
      setShowApiInput(false);
      toast.success("API key saved! You can now search for locations.");
    }
  };

  const handleLocationSearch = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenCage API key first");
      setShowApiInput(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchLocation
        )}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status?.code === 401) {
        toast.error("Invalid API key. Please check and try again.");
        setShowApiInput(true);
        localStorage.removeItem("opencage_api_key");
        return;
      }
      
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
    <div className="container py-8 space-y-6 bg-gradient-to-b from-[#F2FCE2] to-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-800">Breathe Easy 🌱</h1>
        <p className="text-green-700">
          Check your local air quality and help protect our environment! 🌍
        </p>
        
        {showApiInput && (
          <div className="max-w-md mx-auto space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              To use this app, you'll need a free OpenCage API key. Get one at{" "}
              <a 
                href="https://opencagedata.com/users/sign_up" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                opencagedata.com
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your OpenCage API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border-green-200 focus:ring-green-500"
              />
              <Button 
                onClick={handleApiKeySave}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Key
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            placeholder="Enter a location (e.g., London, New York, Tokyo)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
            className="border-green-200 focus:ring-green-500"
          />
          <Button 
            onClick={handleLocationSearch}
            className="bg-green-600 hover:bg-green-700"
          >
            Check Air
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Checking air quality...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-xl text-red-500">Oops! Something went wrong</p>
          <p className="mt-2 text-green-700">Please try searching for a different location</p>
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