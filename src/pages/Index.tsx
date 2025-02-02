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
import { Rocket, Globe, Wind, Search } from "lucide-react";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("opencage_api_key") || "");
  const [waqiApiKey, setWaqiApiKey] = useState(() => localStorage.getItem("waqi_api_key") || "");
  const [showApiInput, setShowApiInput] = useState(!localStorage.getItem("opencage_api_key"));
  const [showWaqiApiInput, setShowWaqiApiInput] = useState(!localStorage.getItem("waqi_api_key"));

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
        toast.success("OpenCage API key saved successfully! 🚀");
      })
      .catch((error) => {
        toast.error(error.message || "Invalid API key. Please check and try again.");
        localStorage.removeItem("opencage_api_key");
      });
  };

  const handleWaqiApiKeySave = () => {
    if (!waqiApiKey.trim()) {
      toast.error("Please enter a valid WAQI API key");
      return;
    }

    fetch(`https://api.waqi.info/feed/here/?token=${waqiApiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error("Invalid WAQI API key");
        }
        localStorage.setItem("waqi_api_key", waqiApiKey);
        setShowWaqiApiInput(false);
        toast.success("WAQI API key saved successfully! 🌍");
      })
      .catch((error) => {
        toast.error(error.message || "Invalid WAQI API key. Please check and try again.");
        localStorage.removeItem("waqi_api_key");
      });
  };

  const handleLocationSearch = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenCage API key first");
      setShowApiInput(true);
      return;
    }

    if (!waqiApiKey) {
      toast.error("Please enter your WAQI API key first");
      setShowWaqiApiInput(true);
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
        toast.error("Invalid OpenCage API key. Please check and try again.");
        setShowApiInput(true);
        localStorage.removeItem("opencage_api_key");
        return;
      }
      
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
};

export default Index;
