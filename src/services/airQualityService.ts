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
  try {
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`
    );
    const data = await response.json();

    if (data.status === "ok") {
      return {
        aqi: data.data.aqi,
        pm25: data.data.iaqi.pm25?.v || 0,
        pm10: data.data.iaqi.pm10?.v || 0,
        no2: data.data.iaqi.no2?.v || 0,
        o3: data.data.iaqi.o3?.v || 0,
        co: data.data.iaqi.co?.v || 0,
        timestamp: data.data.time.iso,
      };
    } else {
      throw new Error("Failed to fetch air quality data");
    }
  } catch (error) {
    toast.error("Error fetching air quality data");
    throw error;
  }
};

export const getAQICategory = (aqi: number): {
  label: string;
  color: string;
  description: string;
} => {
  if (aqi <= 50) {
    return {
      label: "Good",
      color: "bg-aqi-good",
      description: "Air quality is satisfactory, and air pollution poses little or no risk.",
    };
  } else if (aqi <= 100) {
    return {
      label: "Moderate",
      color: "bg-aqi-moderate",
      description: "Air quality is acceptable. However, there may be a risk for some people.",
    };
  } else if (aqi <= 150) {
    return {
      label: "Unhealthy for Sensitive Groups",
      color: "bg-aqi-unhealthy",
      description: "Members of sensitive groups may experience health effects.",
    };
  } else if (aqi <= 200) {
    return {
      label: "Unhealthy",
      color: "bg-aqi-unhealthy",
      description: "Everyone may begin to experience health effects.",
    };
  } else if (aqi <= 300) {
    return {
      label: "Very Unhealthy",
      color: "bg-aqi-veryUnhealthy",
      description: "Health warnings of emergency conditions.",
    };
  } else {
    return {
      label: "Hazardous",
      color: "bg-aqi-hazardous",
      description: "Health alert: everyone may experience serious health effects.",
    };
  }
};