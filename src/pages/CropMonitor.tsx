import React, { useState, useEffect } from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Thermometer, Droplets, Wind, Sun, Lightbulb, Leaf, CloudRain, Waves, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-utils';

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
}

const CropMonitor = () => {
  const { translateSync } = useLanguage();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('https://render-syo4.onrender.com/sensordata');
      const data = await response.json();
      setSensorData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch sensor data. Please try again.');
    }
  };

  useEffect(() => {
    fetchSensorData(); // initial fetch
    const interval = setInterval(fetchSensorData, 5000); // fetch every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const getSensorStatus = (type: keyof SensorData, value: number) => {
    switch (type) {
      case 'temperature':
        return value >= 20 && value <= 30 ? 'ideal' : value < 20 || value > 35 ? 'critical' : 'warning';
      case 'humidity':
        return value >= 60 && value <= 80 ? 'ideal' : value < 50 || value > 90 ? 'critical' : 'warning';
      case 'moisture':
        return value >= 40 && value <= 60 ? 'ideal' : value < 30 || value > 70 ? 'critical' : 'warning';
      case 'light':
        return value >= 5000 && value <= 10000 ? 'ideal' : value < 3000 || value > 12000 ? 'critical' : 'warning';
      default:
        return 'unknown';
    }
  };

  const getSensorRange = (type: keyof SensorData) => {
    switch (type) {
      case 'temperature':
        return { min: 0, max: 50, ideal: [20, 30], warning: [15, 35] };
      case 'humidity':
        return { min: 0, max: 100, ideal: [60, 80], warning: [50, 90] };
      case 'moisture':
        return { min: 0, max: 100, ideal: [40, 60], warning: [30, 70] };
      case 'light':
        return { min: 0, max: 15000, ideal: [5000, 10000], warning: [3000, 12000] };
      default:
        return { min: 0, max: 100, ideal: [0, 100], warning: [0, 100] };
    }
  };

  const AnimatedGauge = ({ type, value, label, icon: Icon, color }: {
    type: keyof SensorData;
    value: number;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
  }) => {
    const status = getSensorStatus(type, value);
    const range = getSensorRange(type);
    const percentage = Math.min(Math.max((value - range.min) / (range.max - range.min) * 100, 0), 100);
    
    const isWarning = status === 'warning';
    const isCritical = status === 'critical';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 12 }}
        whileHover={{ scale: 1.02 }}
        className={`relative overflow-hidden ${
          isCritical ? 'animate-pulse' : isWarning ? 'animate-bounce-gentle' : ''
        }`}
      >
        <Card className={`h-full ${color} text-white rounded-3xl shadow-2xl transition-all duration-500 ease-in-out ${
          isCritical ? 'shadow-red-500/50 ring-4 ring-red-500/30' : 
          isWarning ? 'shadow-yellow-500/50 ring-2 ring-yellow-500/30' : 
          'shadow-green-500/50'
        }`}>
          {/* Glowing background effect for warnings/critical */}
          {(isWarning || isCritical) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-0 ${
                isCritical ? 'bg-red-500/20' : 'bg-yellow-500/20'
              } rounded-3xl`}
            />
          )}
          
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center justify-between text-xl font-bold">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={isCritical ? { 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : { rotate: 360 }}
                  transition={{ 
                    duration: isCritical ? 0.5 : 8, 
                    repeat: Infinity, 
                    ease: isCritical ? "easeInOut" : "linear" 
                  }}
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
                <span>{label}</span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`w-4 h-4 rounded-full ${
                  status === 'ideal' ? 'bg-green-400' :
                  status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                } shadow-lg`}
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10">
            {/* Animated value display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center mb-6"
            >
              <motion.p
                key={value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`text-4xl font-extrabold ${
                  isCritical ? 'animate-pulse' : ''
                }`}
              >
                {value}{type === 'light' ? ' lux' : type === 'temperature' ? '°C' : '%'}
              </motion.p>
              <p className="text-sm opacity-80 mt-1">
                Status: <span className="font-semibold capitalize">{status}</span>
              </p>
            </motion.div>

            {/* Animated gauge bar */}
            <div className="relative h-6 bg-white/20 rounded-full overflow-hidden">
              {/* Background zones */}
              <div className="absolute inset-0 flex">
                <div className="bg-red-500/60 flex-1"></div>
                <div className="bg-yellow-500/60 flex-1"></div>
                <div className="bg-green-500/60 flex-1"></div>
                <div className="bg-yellow-500/60 flex-1"></div>
                <div className="bg-red-500/60 flex-1"></div>
              </div>
              
              {/* Animated fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.6 }}
                className={`h-full ${
                  status === 'ideal' ? 'bg-white' :
                  status === 'warning' ? 'bg-yellow-200' : 'bg-red-200'
                } shadow-lg`}
              />
              
              {/* Needle indicator */}
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: `${Math.max(0, Math.min(percentage - 1, 98))}%` }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.8 }}
                className="absolute top-0 w-1 h-full bg-white shadow-2xl"
              />
            </div>

            {/* Range indicators */}
            <div className="flex justify-between text-xs mt-2 opacity-80">
              <span>{range.min}</span>
              <span className="font-semibold">Ideal: {range.ideal[0]}-{range.ideal[1]}</span>
              <span>{range.max}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl shadow-2xl p-8 border-4 border-red-300"
        >
          <AlertCircle className="h-24 w-24 text-red-500 animate-pulse-slow" />
          <h2 className="text-4xl font-extrabold text-red-700 text-center">{translateSync('Error Fetching Data')}</h2>
          <p className="text-xl text-red-600 text-center max-w-lg leading-relaxed">{error}</p>
          <Button
            onClick={fetchSensorData}
            variant="destructive"
            className="mt-6 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="h-6 w-6 mr-3 animate-spin-slow" />
            {translateSync('Retry Data Fetch')}
          </Button>
        </motion.div>
      );
    }

    if (!sensorData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <Card className="h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-xl overflow-hidden animate-pulse-fast">
                <CardHeader className="pb-4 flex flex-col items-center justify-center h-32">
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }}
                    className="h-16 w-16 bg-gray-300 rounded-full mb-4"
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse", delay: 0.1 }}
                    className="h-6 w-3/4 bg-gray-300 rounded-md"
                  ></motion.div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse", delay: 0.2 }}
                    className="h-12 w-1/2 bg-gray-300 rounded-md mb-2"
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse", delay: 0.3 }}
                    className="h-8 w-2/3 bg-gray-300 rounded-md"
                  ></motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    }

    const springTransition: Transition = { type: "spring", stiffness: 100, damping: 10 };

    const cardVariants: Variants = {
      hidden: { y: 50, opacity: 0, scale: 0.8 },
      visible: { y: 0, opacity: 1, scale: 1, transition: springTransition },
    };

    const valueVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
    };

    return (
      <div className="space-y-8">
        {/* Sensor Gauges */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <AnimatedGauge
            type="temperature"
            value={sensorData.temperature}
            label={translateSync('Temperature')}
            icon={Thermometer}
            color="bg-gradient-to-br from-red-500 to-red-700"
          />
          <AnimatedGauge
            type="humidity"
            value={sensorData.humidity}
            label={translateSync('Humidity')}
            icon={Droplets}
            color="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <AnimatedGauge
            type="moisture"
            value={sensorData.moisture}
            label={translateSync('Moisture')}
            icon={Leaf}
            color="bg-gradient-to-br from-green-500 to-green-700"
          />
          <AnimatedGauge
            type="light"
            value={sensorData.light}
            label={translateSync('Light Intensity')}
            icon={Sun}
            color="bg-gradient-to-br from-yellow-500 to-yellow-700"
          />
        </motion.div>

        {/* System Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-r from-slate-50 to-slate-100 shadow-2xl rounded-3xl border border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                <CheckCircle className="h-8 w-8 mr-3 text-green-600" />
                {translateSync('System Status & Recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Health */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-center p-4 bg-white rounded-2xl shadow-lg"
                >
                  <div className="text-4xl mb-2">🌱</div>
                  <h3 className="font-bold text-slate-700 mb-1">Crop Health</h3>
                  <p className="text-2xl font-bold text-green-600">Excellent</p>
                  <p className="text-sm text-slate-500">All parameters optimal</p>
                </motion.div>

                {/* Active Alerts */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-center p-4 bg-white rounded-2xl shadow-lg"
                >
                  <div className="text-4xl mb-2">🔔</div>
                  <h3 className="font-bold text-slate-700 mb-1">Active Alerts</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-slate-500">No issues detected</p>
                </motion.div>

                {/* Next Action */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="text-center p-4 bg-white rounded-2xl shadow-lg"
                >
                  <div className="text-4xl mb-2">💡</div>
                  <h3 className="font-bold text-slate-700 mb-1">Next Action</h3>
                  <p className="text-sm font-medium text-slate-600">Monitor levels</p>
                  <p className="text-sm text-slate-500">Continue routine care</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-10 p-4 md:p-8 lg:p-12 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <h1 className="text-6xl font-extrabold text-green-700 mb-4 tracking-tight leading-tight drop-shadow-md">
            <span className="inline-block animate-pulse mr-3 text-7xl">🌱</span> {translateSync('Crop Monitor')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
            {translateSync('Real-time environmental insights for thriving crops and sustainable farming.')}
          </p>
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-sm text-gray-500 mt-4"
            >
              Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
            </motion.p>
          )}
        </motion.div>

        {/* Main Content - Sensor Data or Error/Loading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>

      </div>
    </Layout>
  );
};

export default CropMonitor;