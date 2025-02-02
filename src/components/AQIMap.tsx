import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData } from '@/services/airQualityService';
import { toast } from 'sonner';
import { AlertCircle, Wind, Droplets } from 'lucide-react';

interface AQIMapProps {
  data: AirQualityData;
  location: { lat: number; lon: number };
}

export const AQIMap = ({ data, location }: AQIMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.error('Map container or token not available:', { container: !!mapContainer.current, hasToken: !!mapboxToken });
      toast.error('Please check your Mapbox configuration! 🗺️');
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      console.log('Initializing map with token:', mapboxToken);
      
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.error('Error removing existing map:', error);
        }
      }
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.lon, location.lat],
        zoom: 11,
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

      // Create stable marker element
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center w-12 h-12 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2';
      el.style.backgroundColor = getAQIColor(data.aqi);
      el.style.border = '3px solid white';
      el.style.transition = 'all 0.3s ease';
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1) translate(-45%, -45%)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(-50%, -50%)';
      });

      if (marker.current) {
        try {
          marker.current.remove();
        } catch (error) {
          console.error('Error removing existing marker:', error);
        }
      }

      marker.current = new mapboxgl.Marker(el)
        .setLngLat([location.lon, location.lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: 'rounded-lg shadow-lg'
          })
          .setHTML(`
            <div class="p-6 min-w-[300px] space-y-4">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-full" style="background-color: ${getAQIColor(data.aqi)}">
                  <AlertCircle class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold">Air Quality Index</h3>
                  <p class="text-sm text-gray-600">Updated: ${new Date(data.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2 text-lg font-semibold">
                <span class="text-3xl" style="color: ${getAQIColor(data.aqi)}">${data.aqi}</span>
                <span class="text-gray-700">- ${getAQIMessage(data.aqi)}</span>
              </div>

              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <Droplets class="w-4 h-4" /> PM2.5: ${data.pm25} µg/m³
                </div>
                <div class="flex items-center gap-2">
                  <Wind class="w-4 h-4" /> NO₂: ${data.no2} ppb
                </div>
              </div>

              <div class="p-3 bg-gray-50 rounded-lg text-sm">
                <p class="font-medium text-gray-700">${getHealthTip(data.aqi)} 🌿</p>
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      // Add atmosphere effects
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        map.current.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02
        });

        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      });

      // Show welcome toast
      toast.success('Click the marker to see detailed air quality insights! 🎈');

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please check your Mapbox token.');
    }
  }, [location, data, mapboxToken]);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400'; // Good - Bright Green
    if (aqi <= 100) return '#FFFF00'; // Moderate - Yellow
    if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups - Orange
    if (aqi <= 200) return '#FF0000'; // Unhealthy - Red
    if (aqi <= 300) return '#8F3F97'; // Very Unhealthy - Purple
    return '#7E0023'; // Hazardous - Maroon
  };

  const getAQIMessage = (aqi: number): string => {
    if (aqi <= 50) return 'Fresh and Clean! 🌟';
    if (aqi <= 100) return 'Pretty Good! 👍';
    if (aqi <= 150) return 'Take it Easy 😕';
    if (aqi <= 200) return 'Time to Stay In 😷';
    if (aqi <= 300) return 'Not Great! ⚠️';
    return 'Danger Zone! ⛔';
  };

  const getHealthTip = (aqi: number): string => {
    if (aqi <= 50) return 'Perfect day for outdoor activities!';
    if (aqi <= 100) return 'Most people can enjoy outdoor activities.';
    if (aqi <= 150) return 'Consider reducing prolonged outdoor activities.';
    if (aqi <= 200) return 'Everyone should limit outdoor exposure.';
    if (aqi <= 300) return 'Avoid outdoor activities if possible.';
    return 'Stay indoors and keep windows closed.';
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg text-sm max-w-[200px]">
        <p className="font-medium text-gray-700">🎯 Click the marker to see air quality insights!</p>
      </div>
    </div>
  );
};
