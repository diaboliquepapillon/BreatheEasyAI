import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData } from '@/services/airQualityService';
import { toast } from 'sonner';

interface AQIMapProps {
  data: AirQualityData;
  location: { lat: number; lon: number };
}

export const AQIMap = ({ data, location }: AQIMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState(() => localStorage.getItem('mapbox_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('mapbox_token'));

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      if (map.current) {
        map.current.remove();
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

      // Create custom marker element
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

      // Create and add marker with popup
      if (marker.current) {
        marker.current.remove();
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
            <div class="p-4 min-w-[200px]">
              <h3 class="text-lg font-bold mb-2">Air Quality Index</h3>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${getAQIColor(data.aqi)}"></div>
                <span class="font-medium">${data.aqi} - ${getAQIMessage(data.aqi)}</span>
              </div>
              <p class="text-sm text-gray-600">Updated: ${new Date(data.timestamp).toLocaleString()}</p>
            </div>
          `)
        )
        .addTo(map.current);

      // Add terrain and sky
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02
        });

        map.current?.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please check your Mapbox token.');
      setShowTokenInput(true);
      localStorage.removeItem('mapbox_token');
    }
  };

  const handleTokenSave = () => {
    if (!mapboxToken.trim()) {
      toast.error('Please enter a valid Mapbox token');
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    setShowTokenInput(false);
    toast.success('Mapbox token saved successfully!');
    initializeMap();
  };

  useEffect(() => {
    if (!showTokenInput && mapboxToken) {
      initializeMap();
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location, data, showTokenInput, mapboxToken]);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400'; // Good
    if (aqi <= 100) return '#FFFF00'; // Moderate
    if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups
    if (aqi <= 200) return '#FF0000'; // Unhealthy
    if (aqi <= 300) return '#8F3F97'; // Very Unhealthy
    return '#7E0023'; // Hazardous
  };

  const getAQIMessage = (aqi: number): string => {
    if (aqi <= 50) return 'Good 😊';
    if (aqi <= 100) return 'Moderate 👍';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups 😕';
    if (aqi <= 200) return 'Unhealthy 😷';
    if (aqi <= 300) return 'Very Unhealthy ⚠️';
    return 'Hazardous ⛔';
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      {showTokenInput ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-sm">
          <p className="text-sm text-gray-600 mb-4 text-center">
            To use the map feature, you'll need a Mapbox token. Get one at{' '}
            <a 
              href="https://www.mapbox.com/account/access-tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <input
              type="password"
              placeholder="Enter your Mapbox token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTokenSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0" />
      )}
    </div>
  );
};