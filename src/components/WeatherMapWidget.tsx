import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Map as MapIcon, Layers } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface WeatherMapWidgetProps {
  lat?: number;
  lon?: number;
}

type LayerType = 'precipitation' | 'wind' | 'temperature' | 'none';

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMapWidget({ lat = 19.0760, lon = 72.8777 }: WeatherMapWidgetProps) {
  const [activeLayer, setActiveLayer] = useState<LayerType>('precipitation');
  const [layerTime, setLayerTime] = useState<number | null>(null);

  useEffect(() => {
    // Fetch latest rainviewer timestamp for radar maps
    if (activeLayer === 'precipitation') {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(res => res.json())
        .then(data => {
          if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
            setLayerTime(data.radar.past[data.radar.past.length - 1].time);
          }
        })
        .catch(console.error);
    }
  }, [activeLayer]);

  const cardGlass = "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-3xl";

  return (
    <div className={`w-full h-full p-1.5 ${cardGlass} min-h-[300px] relative overflow-hidden group`}>
      <div className="absolute inset-1.5 bg-zinc-50 dark:bg-zinc-950 overflow-hidden rounded-[1.25rem] border border-zinc-200/50 dark:border-zinc-800/50 z-0">
        <MapContainer center={[lat, lon]} zoom={7} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater lat={lat} lon={lon} />

          {/* Rain Viewer Radar Layer */}
          {activeLayer === 'precipitation' && layerTime && (
            <TileLayer
              key={`rain-${layerTime}`}
              url={`https://tilecache.rainviewer.com/v2/radar/${layerTime}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={0.6}
              attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
            />
          )}

          {/* OpenWeatherMap layers (using public demo keys or placeholders if missing) */}
          {activeLayer === 'wind' && (
            <TileLayer
              key="wind"
              url="https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=1f52d0a4c281cd9be0d1e5d79667ee83" // Public demo key
              opacity={0.6}
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
            />
          )}
          
          {activeLayer === 'temperature' && (
            <TileLayer
              key="temp"
              url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=1f52d0a4c281cd9be0d1e5d79667ee83" // Public demo key
              opacity={0.6}
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
            />
          )}
        </MapContainer>
      </div>

      <button className="absolute top-5 right-5 p-2 bg-white/80 shadow-md border border-zinc-200/50 dark:border-zinc-800/50 dark:bg-zinc-900/80 rounded-xl cursor-pointer hover:scale-105 hover:border-indigo-400 transition-all z-20 backdrop-blur-md">
        <Maximize2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
      </button>

      <div className="absolute top-5 left-5 p-2 bg-white/80 shadow-md border border-zinc-200/50 dark:border-zinc-800/50 dark:bg-zinc-900/80 rounded-xl z-20 backdrop-blur-md flex items-center justify-center pointer-events-none">
        <Layers className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 z-20 justify-center">
        <button 
          onClick={() => setActiveLayer(activeLayer === 'precipitation' ? 'none' : 'precipitation')}
          className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border uppercase tracking-widest transition-all shadow-sm cursor-pointer ${activeLayer === 'precipitation' ? 'text-white bg-indigo-500 border-indigo-400 dark:border-indigo-600 shadow-indigo-500/20' : 'text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          Rain
        </button>
        <button 
          onClick={() => setActiveLayer(activeLayer === 'wind' ? 'none' : 'wind')}
          className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border uppercase tracking-widest transition-all shadow-sm cursor-pointer ${activeLayer === 'wind' ? 'text-white bg-indigo-500 border-indigo-400 dark:border-indigo-600 shadow-indigo-500/20' : 'text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          Wind
        </button>
        <button 
          onClick={() => setActiveLayer(activeLayer === 'temperature' ? 'none' : 'temperature')}
          className={`text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border uppercase tracking-widest transition-all shadow-sm cursor-pointer ${activeLayer === 'temperature' ? 'text-white bg-indigo-500 border-indigo-400 dark:border-indigo-600 shadow-indigo-500/20' : 'text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          Temp
        </button>
      </div>
    </div>
  );
}
