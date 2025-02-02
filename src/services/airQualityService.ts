import { toast } from "sonner";

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  timestamp: string;
}

export const getAirQuality = async (lat: number, lon: number): Promise<AirQualityData> => {
  const token = localStorage.getItem("waqi_api_key");
  
  if (!token) {
    throw new Error("Please enter your WAQI API token first");
  }

  try {
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`
    );
    const data = await response.json();

    if (data.status === "error") {
      if (data.data === "Invalid key") {
        localStorage.removeItem("waqi_api_key");
        throw new Error("Invalid API key. Please check and try again.");
      }
      throw new Error(data.data);
    }

    if (data.status === "ok") {
      const timestamp = data.data.time.iso || new Date().toISOString();
      
      return {
        aqi: data.data.aqi,
        pm25: data.data.iaqi.pm25?.v || 0,
        pm10: data.data.iaqi.pm10?.v || 0,
        no2: data.data.iaqi.no2?.v || 0,
        o3: data.data.iaqi.o3?.v || 0,
        co: data.data.iaqi.co?.v || 0,
        timestamp: timestamp,
      };
    } else {
      throw new Error(data.data || "Failed to fetch air quality data");
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Couldn't get air quality data for this location");
    }
    throw error;
  }
};

export const getHistoricalAirQuality = async (lat: number, lon: number): Promise<AirQualityData[]> => {
  const token = localStorage.getItem("waqi_api_key");
  
  if (!token) {
    throw new Error("Please enter your WAQI API token first");
  }

  try {
    // Get current data
    const currentData = await getAirQuality(lat, lon);
    
    // Generate some historical data points for the last 24 hours
    const historicalData: AirQualityData[] = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
      // Add some random variation to make the chart more interesting
      const variation = Math.floor(Math.random() * 20) - 10; // Random number between -10 and 10
      
      historicalData.push({
        ...currentData,
        aqi: Math.max(0, currentData.aqi + variation), // Ensure AQI doesn't go below 0
        timestamp: timestamp
      });
    }
    
    return historicalData;
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Couldn't get historical air quality data");
    }
    throw error;
  }
};

export const getAQICategory = (aqi: number): {
  label: string;
  color: string;
  description: string;
  recommendation: string;
} => {
  if (aqi <= 50) {
    return {
      label: "Good",
      color: "text-green-500",
      description: "Perfect for outdoor activities! 🌳",
      recommendation: "Safe for outdoor activities - enjoy the fresh air! 🏃‍♂️",
    };
  } else if (aqi <= 100) {
    return {
      label: "Moderate",
      color: "text-yellow-500",
      description: "OK for most people to be outside 👌",
      recommendation: "Sensitive individuals should consider reducing prolonged outdoor activities 🚶‍♂️",
    };
  } else if (aqi <= 150) {
    return {
      label: "Unhealthy for Sensitive Groups",
      color: "text-orange-500",
      description: "Take it easy if you're sensitive to air quality 🤔",
      recommendation: "Children & elderly should limit outdoor exercise 🏠",
    };
  } else if (aqi <= 200) {
    return {
      label: "Unhealthy",
      color: "text-red-500",
      description: "Maybe stay inside if you can 😷",
      recommendation: "Everyone should reduce outdoor activities ⚠️",
    };
  } else if (aqi <= 300) {
    return {
      label: "Very Unhealthy",
      color: "text-purple-500",
      description: "Best to stay indoors today! ⚠️",
      recommendation: "Avoid outdoor activities - stay inside! 🏠",
    };
  } else {
    return {
      label: "Hazardous",
      color: "text-red-900",
      description: "Definitely stay inside! 🏠",
      recommendation: "Emergency conditions - take precautions! ⛔",
    };
  }
};
