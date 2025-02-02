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

      // Create stable marker element with fixed positioning
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full shadow-lg';
      el.style.backgroundColor = getAQIColor(data.aqi);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      
      if (marker.current) {
        marker.current.remove();
      }

      // Create popup with mobile-friendly styling
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '300px',
        className: 'custom-popup'
      })
      .setHTML(`
        <div class="p-4 max-w-[280px] space-y-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-full" style="background-color: ${getAQIColor(data.aqi)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold">Air Quality Index</h3>
              <p class="text-xs text-gray-600">${new Date(data.timestamp).toLocaleString()}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold" style="color: ${getAQIColor(data.aqi)}">${data.aqi}</span>
            <span class="text-sm text-gray-700">${getAQIMessage(data.aqi)}</span>
          </div>

          <div class="space-y-1.5 text-xs text-gray-600">
            <div class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v16M8 8l4-5 4 5"></path>
              </svg>
              PM2.5: ${data.pm25} µg/m³
            </div>
            <div class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2"></path>
              </svg>
              NO₂: ${data.no2} ppb
            </div>
          </div>

          <div class="p-2 bg-gray-50 rounded text-xs">
            <p class="font-medium text-gray-700">${getHealthTip(data.aqi)} 🌿</p>
          </div>
        </div>
      `);

      marker.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
      .setLngLat([location.lon, location.lat])
      .setPopup(popup)
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
      <style jsx global>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .custom-popup {
          max-width: 90vw !important;
        }
        @media (max-width: 640px) {
          .custom-popup {
            font-size: 14px;
          }
        }
      `}</style>
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg text-sm max-w-[200px]">
        <p className="font-medium text-gray-700">🎯 Click the marker to see air quality insights!</p>
      </div>
    </div>
  );
};