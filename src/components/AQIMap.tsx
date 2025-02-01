import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData } from '@/services/airQualityService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AQIMapProps {
  data: AirQualityData;
  location: { lat: number; lon: number };
}

export const AQIMap = ({ data, location }: AQIMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || isMapInitialized) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [location.lon, location.lat],
        zoom: 10
      });

      // Add navigation controls
      const navControl = new mapboxgl.NavigationControl();
      map.current.addControl(navControl, 'top-right');

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
                <h3 class="font-bold">Air Quality Index</h3>
                <p class="text-lg">${data.aqi}</p>
              </div>
            `)
        )
        .addTo(map.current);

      setIsMapInitialized(true);

      // Cleanup function
      return () => {
        if (marker.current) {
          marker.current.remove();
          marker.current = null;
        }
        if (map.current) {
          map.current.removeControl(navControl);
          map.current.remove();
          map.current = null;
        }
        setIsMapInitialized(false);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsMapInitialized(false);
    }
  };

  useEffect(() => {
    const cleanup = initializeMap();
    return () => {
      cleanup?.();
    };
  }, [mapboxToken, location, data]);

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400';
    if (aqi <= 100) return '#FFFF00';
    if (aqi <= 150) return '#FF7E00';
    if (aqi <= 200) return '#FF0000';
    if (aqi <= 300) return '#8F3F97';
    return '#7E0023';
  };

  if (!isMapInitialized) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600">
          Please enter your Mapbox public token to initialize the map. 
          You can get one at https://mapbox.com/
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="Enter your Mapbox token"
            className="flex-1"
          />
          <Button onClick={initializeMap} disabled={!mapboxToken}>
            Initialize Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};