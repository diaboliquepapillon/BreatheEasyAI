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
import { Rocket, Globe, Wind } from "lucide-react";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("opencage_api_key") || "");
  const [showApiInput, setShowApiInput] = useState(!localStorage.getItem("opencage_api_key"));

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=London&key=${apiKey}`)
      .then(response => {
        if (response.status === 401) {
          throw new Error("Invalid API key");
        }
        if (!response.ok) {
          throw new Error("Failed to validate API key");
        }
        return response.json();
      })
      .then(() => {
        localStorage.setItem("opencage_api_key", apiKey);
        setShowApiInput(false);
        toast.success("API key saved successfully! 🚀");
      })
      .catch((error) => {
        toast.error(error.message || "Invalid API key. Please check and try again.");
        localStorage.removeItem("opencage_api_key");
      });
  };

  const handleLocationSearch = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenCage API key first");
      setShowApiInput(true);
      return;
    }

    if (!searchLocation.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchLocation
        )}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status?.code === 401 || data.status?.code === 403) {
        toast.error("Invalid API key. Please check and try again.");
        setShowApiInput(true);
        localStorage.removeItem("opencage_api_key");
        return;
      }
      
      if (data.results && data.results.length > 0) {
        const { lat, lng: lon } = data.results[0].geometry;
        setLocation({ lat, lon });
        toast.success("Location found! Checking air quality... 🌍");
      } else {
        toast.error("Location not found. Please try again with a different search term.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Couldn't find this location. Please try again.");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["airQuality", location?.lat, location?.lon],
    queryFn: () => (location ? getAirQuality(location.lat, location.lon) : null),
    enabled: !!location,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2FCE2] to-white">
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wind className="w-8 h-8 text-green-600 animate-bounce" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AirCheck Pro
            </h1>
            <Globe className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
          <p className="text-lg text-green-700 max-w-2xl mx-auto">
            Hey there! 👋 Want to know how clean the air is in your area? Just type in your location below and let's find out! 🌍✨
          </p>
        
        {showApiInput && (
          <div className="max-w-md mx-auto space-y-4 p-6 bg-white rounded-xl shadow-lg border-2 border-green-100 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Rocket className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Get Started!</h2>
            </div>
            <p className="text-sm text-green-700">
              To use this app, you'll need a free OpenCage API key. Get one at{" "}
              <a 
                href="https://opencagedata.com/users/sign_up" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
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
            placeholder="Type any location (e.g., Tokyo, New York, Paris)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
            className="border-green-200 focus:ring-green-500"
          />
          <Button 
            onClick={handleLocationSearch}
            className="bg-green-600 hover:bg-green-700 transition-all hover:scale-105"
          >
            Check Air
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading your results... 🌿</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-xl text-red-500">Oops! Something went wrong 😅</p>
          <p className="mt-2 text-green-700">Try searching for a different location!</p>
        </div>
      )}

      {data && location && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="space-y-6">
            <AQIDisplay data={data} />
            <PollutantsDisplay data={data} />
          </div>
          <div className="space-y-6">
            <AQIMap data={data} location={location} />
            <TrendChart data={[data]} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Index;