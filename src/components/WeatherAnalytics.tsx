import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer,
  Map, Calendar, RefreshCw, Search, Download, FileText,
  Settings2, Maximize2, MapPin, Activity,
  AlertTriangle, Flame, Umbrella, ArrowRight, TrendingUp
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import TiltCard from "./TiltCard";
import WeatherMapWidget from "./WeatherMapWidget";

const MOCK_TRENDS = [
  { time: "00:00", temp: 18, humidity: 45, wind: 12 },
  { time: "04:00", temp: 16, humidity: 50, wind: 10 },
  { time: "08:00", temp: 22, humidity: 40, wind: 15 },
  { time: "12:00", temp: 28, humidity: 35, wind: 18 },
  { time: "16:00", temp: 29, humidity: 30, wind: 22 },
  { time: "20:00", temp: 24, humidity: 40, wind: 14 },
];

const MOCK_PRECIP = [
  { day: "Mon", rain: 10, snow: 0 },
  { day: "Tue", rain: 15, snow: 0 },
  { day: "Wed", rain: 5, snow: 0 },
  { day: "Thu", rain: 0, snow: 0 },
  { day: "Fri", rain: 25, snow: 0 },
  { day: "Sat", rain: 8, snow: 0 },
  { day: "Sun", rain: 0, snow: 0 },
];

const MOCK_HISTORICAL = [
  { day: "Mon", currentWeek: 22, prevWeek: 20 },
  { day: "Tue", currentWeek: 24, prevWeek: 18 },
  { day: "Wed", currentWeek: 21, prevWeek: 19 },
  { day: "Thu", currentWeek: 19, prevWeek: 22 },
  { day: "Fri", currentWeek: 23, prevWeek: 23 },
  { day: "Sat", currentWeek: 26, prevWeek: 24 },
  { day: "Sun", currentWeek: 28, prevWeek: 21 },
];

const FORECAST_7D = [
  { day: "Mon", high: 28, low: 18, rain: 10, icon: <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
  { day: "Tue", high: 26, low: 16, rain: 40, icon: <CloudRain className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> },
  { day: "Wed", high: 24, low: 15, rain: 80, icon: <CloudRain className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> },
  { day: "Thu", high: 22, low: 14, rain: 20, icon: <Cloud className="w-6 h-6 text-slate-400 dark:text-slate-300" /> },
  { day: "Fri", high: 25, low: 15, rain: 0, icon: <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
  { day: "Sat", high: 29, low: 18, rain: 0, icon: <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
  { day: "Sun", high: 31, low: 20, rain: 0, icon: <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
];

const MiniGauge = ({ label, value, unit, percentage, colorClass }: any) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-3 shadow-sm">
      <div className="relative w-12 h-12 flex items-center justify-center mb-2">
         <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-200/50 dark:text-zinc-800" />
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={colorClass} />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{value}</span>
         </div>
      </div>
      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 font-mono tracking-widest">{label}</span>
      <span className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">{unit}</span>
    </div>
  );
};

export default function WeatherAnalytics({ triggerSystemMessage, triggerSystemAction }: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationName, setLocationName] = useState("Mumbai, India");
  const [searchQuery, setSearchQuery] = useState("Mumbai");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aqiData, setAqiData] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 19.0760, lon: 72.8777 });

  const fetchWeatherData = async (query: string) => {
    setLoading(true);
    setError(false);
    try {
      if (triggerSystemMessage) triggerSystemMessage("Weather Analytics", `Locating ${query}...`, "INFO");
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
          if (triggerSystemMessage) triggerSystemMessage("Geocoding Error", `Location "${query}" not found. Try another search.`, "WARN");
          
          if (weatherData) {
            setSearchQuery(locationName.split(',')[0]);
            setLoading(false);
            return;
          } else {
            // Fallback for initial load
            const fallbackRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=Mumbai&count=1&language=en&format=json`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData.results && fallbackData.results.length > 0) {
              geoData.results = fallbackData.results;
              setSearchQuery("Mumbai");
            } else {
              throw new Error("Location not found");
            }
          }
      }
      const loc = geoData.results[0];
      setLocationName(`${loc.name}, ${loc.country || ''}`);
      setCoords({ lat: loc.latitude, lon: loc.longitude });
      
      let weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`);
      let wData = await weatherRes.json();
      
      if (wData.error && wData.reason?.includes("Timezone")) {
          // Fallback to GMT if auto timezone fails for this location (e.g. middle of ocean)
          weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=GMT`);
          wData = await weatherRes.json();
      }

      if (wData.error) throw new Error(wData.reason || "Weather API Error");
      setWeatherData(wData);
      
      try {
        let aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&timezone=auto`);
        let aData = await aqiRes.json();
        if (aData.error && aData.reason?.includes("Timezone")) {
           aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&timezone=GMT`);
           aData = await aqiRes.json();
        }
        if (!aData.error) setAqiData(aData);
      } catch (err) {
        console.error("AQI error", err);
      }
      
      if (triggerSystemMessage) triggerSystemMessage("Weather Analytics", `Satellite feeds synchronized for ${loc.name}.`, "SUCCESS");
    } catch (e) {
      console.error("Weather fetch failed:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(searchQuery);
  }, []);

  const handleRefresh = () => {
    fetchWeatherData(searchQuery);
  };

  const handleExport = (format: string) => {
    triggerSystemAction("EXPORT", `Weather telemetry exported to ${format}`);
    triggerSystemMessage("Export Started", `Generating ${format} report...`, "INFO");
  };

  const currentTemp = weatherData?.current?.temperature_2m !== undefined ? Math.round(weatherData.current.temperature_2m) : "--";
  const feelsLike = weatherData?.current?.apparent_temperature !== undefined ? Math.round(weatherData.current.apparent_temperature) : "--";
  const humidity = weatherData?.current?.relative_humidity_2m ?? "--";
  const windSpeed = weatherData?.current?.wind_speed_10m !== undefined ? Math.round(weatherData.current.wind_speed_10m) : "--";
  const pressure = weatherData?.current?.surface_pressure !== undefined ? Math.round(weatherData.current.surface_pressure) : "--";
  const uvIndex = weatherData?.daily?.uv_index_max?.[0] ?? "--";

  const sunrise = weatherData?.daily?.sunrise?.[0] ? new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--";
  const sunset = weatherData?.daily?.sunset?.[0] ? new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--";
  const visibility = weatherData?.hourly?.visibility?.[0] ? Math.round(weatherData.hourly.visibility[0] / 1000) : "--"; 
  const dewPoint = weatherData?.hourly?.dew_point_2m?.[0] !== undefined ? Math.round(weatherData.hourly.dew_point_2m[0]) : "--";

  const weatherCode = weatherData?.current?.weather_code;
  let weatherString = "Partly Cloudy";
  if (weatherCode === 0) weatherString = "Clear Sky";
  else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) weatherString = "Partly Cloudy";
  else if (weatherCode >= 45 && weatherCode <= 48) weatherString = "Foggy";
  else if (weatherCode >= 51 && weatherCode <= 67) weatherString = "Rainy";
  else if (weatherCode >= 71 && weatherCode <= 77) weatherString = "Snowy";
  else if (weatherCode >= 95) weatherString = "Thunderstorm";

  const aqiValue = aqiData?.current?.european_aqi ?? "--";
  let aqiLabel = "Fair";
  if (aqiValue < 20) aqiLabel = "Good";
  else if (aqiValue < 40) aqiLabel = "Fair";
  else if (aqiValue < 60) aqiLabel = "Moderate";
  else if (aqiValue < 80) aqiLabel = "Poor";
  else if (aqiValue >= 80) aqiLabel = "Very Poor";

  const pm25 = aqiData?.current?.pm2_5 !== undefined ? Math.round(aqiData.current.pm2_5) : "--";
  const pm10 = aqiData?.current?.pm10 !== undefined ? Math.round(aqiData.current.pm10) : "--";
  const co = aqiData?.current?.carbon_monoxide !== undefined ? Math.round(aqiData.current.carbon_monoxide) : "--";
  const no2 = aqiData?.current?.nitrogen_dioxide !== undefined ? Math.round(aqiData.current.nitrogen_dioxide) : "--";

  const dynamicTrendData = weatherData?.hourly?.time?.slice(0, 8).map((t: string, i: number) => ({
      time: new Date(t).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      temp: weatherData.hourly.temperature_2m[i],
      humidity: weatherData.hourly.relative_humidity_2m[i],
      wind: weatherData.hourly.wind_speed_10m[i]
  })) || MOCK_TRENDS;

  const dynamicPrecipData = weatherData?.daily?.time?.map((t: string, i: number) => ({
      day: new Date(t).toLocaleDateString("en-US", {weekday: 'short'}),
      rain: weatherData.daily.precipitation_sum[i],
      snow: 0
  })) || MOCK_PRECIP;

  const dynamicForecast7D = weatherData?.daily?.time?.map((t: string, i: number) => {
      const code = weatherData.daily.weather_code[i];
      let icon = <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />;
      if (code >= 51 && code <= 67) icon = <CloudRain className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
      else if (code >= 71 && code <= 77) icon = <Umbrella className="w-6 h-6 text-zinc-400" />;
      else if (code >= 1 && code <= 48) icon = <Cloud className="w-6 h-6 text-zinc-400 dark:text-zinc-300" />;

      return {
          day: new Date(t).toLocaleDateString("en-US", {weekday: 'short'}),
          high: Math.round(weatherData.daily.temperature_2m_max[i]),
          low: Math.round(weatherData.daily.temperature_2m_min[i]),
          rain: Math.round(weatherData.daily.precipitation_sum[i]),
          icon
      };
  }) || FORECAST_7D;

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Atmospheric Data Unavailable</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">The meteorological satellite link is currently degraded. Cannot establish handshake with OpenWeather API.</p>
        <button onClick={() => setError(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
          Retry Connection
        </button>
      </div>
    );
  }

  const cardGlass = "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-3xl";
  const textNeonBlue = "text-indigo-600 dark:text-indigo-400";
  const textNeonPurple = "text-indigo-600 dark:text-indigo-400";

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-transparent relative min-h-full transition-colors duration-500 w-full max-w-full overflow-x-hidden">
      
      {/* Background Decor for dark mode only via opacities or specific logic 
          We'll keep it subtle so it blends well with the Light theme */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 p-6 ${cardGlass}`}>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl shrink-0 bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-500/30 shadow-sm ${textNeonBlue}`}><Cloud className="w-5 h-5" /></span>
              Weather Analytics
            </h1>
            <div className="flex items-center gap-2 mt-3 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-900/50 px-2.5 py-1 rounded-md text-xs font-bold font-mono border border-zinc-200/50 dark:border-zinc-800/50">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {locationName}
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 mx-1">•</span>
              <span className="hidden sm:inline text-xs font-bold tracking-wide">Last updated: Just now</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleRefresh(); }} className="relative flex-1 xl:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, country..."
                className="w-full xl:w-64 pl-10 pr-4 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-indigo-300 dark:hover:border-zinc-700 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-zinc-100 transition-all font-bold appearance-none shadow-sm"
              />
            </form>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-[13px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-500" /> Today
            </button>
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[13px] font-bold transition-colors shadow-sm ${filtersOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300' : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
            >
              <Settings2 className="w-4 h-4" /> Filters
            </button>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* FILTERS PANEL */}
        <AnimatePresence>
            {filtersOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className={`p-6 ${cardGlass} flex flex-wrap gap-6 mt-6`}>
                    <div className="space-y-2 flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Date Range</label>
                        <select className="w-full p-2.5 text-[13px] bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold shadow-sm">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="space-y-2 flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Metrics</label>
                        <select className="w-full p-2.5 text-[13px] bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold shadow-sm">
                            <option>All Variables</option>
                            <option>Temperature Only</option>
                            <option>Precipitation</option>
                        </select>
                    </div>
                     <div className="space-y-2 flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Export Protocol</label>
                        <div className="flex gap-2">
                             <button onClick={() => handleExport("CSV")} className="flex-1 py-2.5 bg-white/80 hover:bg-zinc-50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] font-bold rounded-xl dark:text-zinc-100 transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"><FileText className="w-3.5 h-3.5 text-indigo-500"/> CSV</button>
                             <button onClick={() => handleExport("JSON")} className="flex-1 py-2.5 bg-white/80 hover:bg-zinc-50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] font-bold rounded-xl dark:text-zinc-100 transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"><FileText className="w-3.5 h-3.5 text-indigo-500"/> JSON</button>
                             <button onClick={() => handleExport("PDF")} className="flex-1 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-[11px] font-bold rounded-xl transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"><Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-500"/> PDF</button>
                        </div>
                    </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`h-32 animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-3xl`} />
                ))}
            </div>
        ) : (
        <>
            {/* KPI CARDS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
            
            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between group cursor-default hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Current Temp</span>
                    <Thermometer className={`w-4 h-4 sm:w-5 sm:h-5 ${textNeonBlue} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 relative z-10">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{currentTemp}</div>
                  <div className="text-lg sm:text-xl text-zinc-400 font-bold mb-1">°C</div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-3 sm:mt-4 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-md w-fit relative z-10"><TrendingUp className="w-3 h-3"/> +2.4° today</div>
            </div>
            </TiltCard>

            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between group cursor-default hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Feels Like</span>
                    <Flame className={`w-4 h-4 sm:w-5 sm:h-5 text-orange-500 group-hover:scale-110 transition-transform`} />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 relative z-10">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{feelsLike}</div>
                  <div className="text-lg sm:text-xl text-zinc-400 font-bold mb-1">°C</div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 sm:mt-4 font-bold bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md w-fit relative z-10">High humidity factor</div>
            </div>
            </TiltCard>

            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors`}>
                <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Humidity</span>
                    <Droplets className={`w-4 h-4 sm:w-5 sm:h-5 ${textNeonPurple} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 z-10">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{humidity}</div>
                  <div className="text-lg sm:text-xl text-zinc-400 font-bold mb-1">%</div>
                </div>
                {/* Circular indicator bg */}
                <div className="absolute -bottom-8 -right-8 w-28 h-28 sm:-bottom-6 sm:-right-6 sm:w-24 sm:h-24 rounded-full border-[6px] sm:border-[8px] border-indigo-50 dark:border-indigo-900/30" />
                <div className="absolute -bottom-8 -right-8 w-28 h-28 sm:-bottom-6 sm:-right-6 sm:w-24 sm:h-24 rounded-full border-[6px] sm:border-[8px] border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent dark:border-t-indigo-400 dark:border-r-indigo-400 rotate-45 transform transition-transform group-hover:rotate-90 duration-700" />
            </div>
            </TiltCard>

            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between group cursor-default hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Wind</span>
                    <Wind className={`w-4 h-4 sm:w-5 sm:h-5 ${textNeonBlue} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 relative z-10">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{windSpeed}</div>
                  <div className="text-xs sm:text-sm text-zinc-500 font-bold mb-1.5 uppercase">km/h</div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-700 dark:text-zinc-300 mt-3 sm:mt-4 font-bold flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md w-fit relative z-10">NE <ArrowRight className="w-3 h-3 -rotate-45 text-indigo-500" /></div>
            </div>
            </TiltCard>

            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between group cursor-default hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Pressure</span>
                    <Activity className={`w-4 h-4 sm:w-5 sm:h-5 ${textNeonBlue} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 relative z-10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{pressure}</div>
                  <div className="text-xs sm:text-sm text-zinc-500 font-bold mb-1 sm:mb-1.5 uppercase">hPa</div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 sm:mt-4 font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-md w-fit uppercase font-mono tracking-widest relative z-10"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5"></span>Stable</div>
            </div>
            </TiltCard>

            <TiltCard>
            <div className={`p-5 lg:p-6 ${cardGlass} h-full flex flex-col justify-between group cursor-default hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative overflow-hidden`}>
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">UV Index</span>
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-5 sm:mt-6 flex items-end gap-1.5 relative z-10">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-600 dark:text-yellow-500 tracking-tighter">{uvIndex}</div>
                  <div className="text-xs sm:text-sm text-zinc-400 font-bold mb-1.5">/ 10</div>
                </div>
                <div className="text-[9px] sm:text-[10px] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold px-2 py-1 rounded-md mt-3 sm:mt-4 inline-block w-fit uppercase tracking-widest font-mono border border-red-100 dark:border-red-500/20 relative z-10">Very High</div>
            </div>
            </TiltCard>

            </div>

            {/* MAIN DASHBOARD ROWS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
                
                {/* CURRENT WEATHER OVERVIEW */}
                <div className={`xl:col-span-1 p-6 sm:p-8 ${cardGlass} relative overflow-hidden flex flex-col justify-between`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono mb-8 relative z-10 flex items-center gap-3">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> Live Summary
                    </h3>

                    <div className="flex flex-col items-center justify-center py-6 relative z-10 flex-1">
                        <motion.div 
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <Sun className="w-28 h-28 sm:w-32 sm:h-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
                            <motion.div 
                                animate={{ x: [-4, 4, -4] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[-15px] left-[-25px]"
                            >
                              <Cloud className="w-20 h-20 sm:w-24 sm:h-24 text-white dark:text-zinc-200 drop-shadow-xl" fill="currentColor" />
                            </motion.div>
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 mt-10 tracking-tighter">{weatherString}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2.5 text-center text-[13px] font-medium max-w-[200px] leading-relaxed">
                            Condition expected to remain stable throughout the afternoon.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50 relative z-10">
                        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest block mb-1.5 font-mono">Sunrise</span>
                            <span className="text-sm font-bold font-display text-zinc-900 dark:text-zinc-50">{sunrise}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest block mb-1.5 font-mono">Sunset</span>
                            <span className="text-sm font-bold font-display text-zinc-900 dark:text-zinc-50">{sunset}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest block mb-1.5 font-mono">Visibility</span>
                            <span className="text-sm font-bold font-display text-zinc-900 dark:text-zinc-50">{visibility} km</span>
                        </div>
                        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest block mb-1.5 font-mono">Dew Point</span>
                            <span className="text-sm font-bold font-display text-zinc-900 dark:text-zinc-50">{dewPoint} °C</span>
                        </div>
                    </div>
                </div>

                {/* WEATHER TRENDS & AQI */}
                <div className="xl:col-span-2 space-y-6 flex flex-col">
                    {/* CHARTS */}
                    <div className={`p-6 sm:p-8 ${cardGlass} min-h-[340px] flex flex-col`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono flex items-center gap-3">
                                <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> Trend Analytics
                            </h3>
                            <div className="flex bg-white/50 dark:bg-zinc-900/50 rounded-lg max-w-[fit-content] p-1 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                                <button className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-md shadow-sm">Temp</button>
                                <button className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">Hum</button>
                                <button className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">Wind</button>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dynamicTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(63, 63, 70, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(8px)', padding: '10px 14px' }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="temp" stroke="url(#tempGlow)" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#4f46e5' }} />
                                    <defs>
                                        <linearGradient id="tempGlow" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#c084fc" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PRECIP & AQI ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        <div className={`p-6 sm:p-8 ${cardGlass} flex flex-col`}>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-6 uppercase tracking-widest font-mono flex items-center gap-3">
                              <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> Precip Forecast
                            </h3>
                            <div className="flex-1 w-full min-h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dynamicPrecipData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                        <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(63, 63, 70, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(8px)' }} />
                                        <Area type="monotone" dataKey="rain" stroke="#0ea5e9" fill="url(#rainGradient)" fillOpacity={1} strokeWidth={3} />
                                        <defs>
                                          <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={`p-6 sm:p-8 ${cardGlass} relative overflow-hidden flex flex-col justify-center`}>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-7 uppercase tracking-widest font-mono flex items-center gap-3">
                              <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> Air Quality Base
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="text-center shrink-0">
                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                            <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                                            <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="289" strokeDashoffset="120" strokeLinecap="round" className="text-emerald-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{aqiValue}</span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-4 block py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm">{aqiLabel}</span>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                                    <MiniGauge label="PM2.5" value={pm25} unit="µg/m³" percentage={20} colorClass="text-emerald-500" />
                                    <MiniGauge label="PM10" value={pm10} unit="µg/m³" percentage={15} colorClass="text-emerald-500" />
                                    <MiniGauge label="CO" value={co} unit="µg/m³" percentage={35} colorClass="text-yellow-500" />
                                    <MiniGauge label="NO2" value={no2} unit="µg/m³" percentage={60} colorClass="text-orange-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOWER ROW: FORECAST & LAYER MAP */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
                
                {/* 7-DAY FORECAST */}
                <div className={`xl:col-span-8 p-6 sm:p-8 ${cardGlass}`}>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> 7-Day Matrix Array
                    </h3>
                    <div className="flex overflow-x-auto pb-6 gap-4 sm:gap-5 snap-x smooth-scroll scrollbar-hide mr-[-1rem] pr-[1rem]">
                        {dynamicForecast7D.map((day, idx) => (
                            <div key={idx} className="flex-none w-[130px] bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 flex flex-col items-center justify-center snap-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer group">
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">{day.day}</span>
                                <div className="my-5 group-hover:scale-110 transition-transform">
                                    {day.icon}
                                </div>
                                <div className="flex gap-2 text-[15px] font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                                    <span>{day.high}°</span>
                                    <span className="text-zinc-400 font-bold">{day.low}°</span>
                                </div>
                                <div className={`text-[10px] flex gap-1.5 mt-4 font-bold w-full justify-between font-mono`}>
                                    <span className={`px-2 py-1 rounded-md border flex items-center justify-center flex-1 ${day.rain > 0 ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400" : "bg-white/50 text-zinc-400 border-zinc-200/50 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-500"}`}><Umbrella className="w-2.5 h-2.5 mr-1" />{day.rain}mm</span>
                                    <span className="px-2 py-1 rounded-md border bg-white/50 text-zinc-400 border-zinc-200/50 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-500 flex items-center justify-center flex-1">10 <Wind className="w-2.5 h-2.5 ml-1" /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAP WIDGET */}
                <div className={`xl:col-span-4 ${cardGlass} min-h-[300px] relative overflow-hidden group`}>
                   <WeatherMapWidget lat={coords.lat} lon={coords.lon} />
                </div>

            </div>

             {/* HISTORICAL COMPARISON */}
             <div className={`mt-6 p-6 sm:p-8 ${cardGlass}`}>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span> Historical Variance Array
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_HISTORICAL} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(63, 63, 70, 0.5)', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold', backdropFilter: 'blur(8px)' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '16px' }} />
                            <Line type="monotone" dataKey="currentWeek" name="Current Week Cycle" stroke="#4f46e5" strokeWidth={3} dot={{ strokeWidth: 2, r: 5, fill: "#fff" }} activeDot={{ r: 7, fill: "#4f46e5", strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="prevWeek" name="Previous Week Cycle" stroke="#a1a1aa" strokeDasharray="6 6" strokeWidth={2} dot={{ r: 3, fill: "#a1a1aa" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
             </div>

        </>
        )}
      </div>
    </div>
  );
}
