import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData } from '@/services/airQualityService';

interface AQIMapProps {
  data: AirQualityData;
  location: { lat: number; lon: number };
}

export const AQIMap = ({ data, location }: AQIMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHNlOWF2NWowMGRqMmptbGVwZ2E1ZXd2In0.qY4WMsDrKiF4wCErnXFyTw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [location.lon, location.lat],
      zoom: 10
    });

    // Add marker for AQI data
    const el = document.createElement('div');
    el.className = 'aqi-marker';
    el.style.backgroundColor = getAQIColor(data.aqi);
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([location.lon, location.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">Air Quality Here</h3>
              <p class="text-lg">${getAQIMessage(data.aqi)}</p>
            </div>
          `)
      )
      .addTo(map.current);

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location, data]);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400'; // Good
    if (aqi <= 100) return '#FFFF00'; // Moderate
    if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups
    if (aqi <= 200) return '#FF0000'; // Unhealthy
    if (aqi <= 300) return '#8F3F97'; // Very Unhealthy
    return '#7E0023'; // Hazardous
  };

  const getAQIMessage = (aqi: number): string => {
    if (aqi <= 50) return "The air is clean! 😊";
    if (aqi <= 100) return "Air is okay. Sensitive people should take care 👍";
    if (aqi <= 150) return "Not great for sensitive groups 😕";
    if (aqi <= 200) return "Everyone might feel effects 😷";
    if (aqi <= 300) return "Health warning! Take care! ⚠️";
    return "Hazardous! Stay inside! ⛔";
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};