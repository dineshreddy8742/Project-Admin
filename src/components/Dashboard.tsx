import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useLanguage } from '@/contexts/language-utils';
import { useWeather } from '@/hooks/useWeather';
import { usePlan } from '@/contexts/PlanContext';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Eye,
  Gauge,
  RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { translate, translateSync, currentLanguage } = useLanguage();
  const { weatherData, loading, error, refetch } = useWeather();
  const { hasFeatureAccess, setPlan, currentPlan } = usePlan();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user data and set plan
  useEffect(() => {
    const user = localStorage.getItem('agritech_current_user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      if (userData.plan) {
        setPlan(userData.plan);
      }
    }
  }, [setPlan]);

  // Translate static texts when language changes
  useEffect(() => {
    const translateStaticTexts = async () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      const textsToTranslate = [
        'Crop Monitor',
        'Disease Check', 
        'Market Price',
        'Gov Schemes',
        'Weather Daily Forecast',
        'Market Trends',
        'AI Assistant',
        'Grocery Market',
        'Welcome, Farmer!',
        'Digital Farming Assistant',
        'Monitor your crops',
        'Get AI insights',
        'Maximize your harvest',
        'Temperature',
        'Light Intensity',
        'Humidity',
        'Condition',
        'Wind Speed',
        'Pressure',
        'Cloud Cover',
        'Visibility',
        "Today's Weather",
        'Loading weather data...'
      ];

      const translated: Record<string, string> = {};
      
      for (const text of textsToTranslate) {
        try {
          translated[text] = await translate(text);
        } catch (error) {
          translated[text] = text;
        }
      }
      
      setTranslatedTexts(translated);
    };

    translateStaticTexts();
  }, [currentLanguage, translate]);

  const t = (text: string) => translatedTexts[text] || translateSync(text) || text;

  const quickActions = React.useMemo(() => {
    const allQuickActions = [
      { title: t('Crop Monitor'), emoji: '🌾', color: 'bg-primary', route: '/crop-monitor', feature: 'crop-monitor' },
      { title: t('Disease Check'), emoji: '🦠', color: 'bg-secondary', route: '/disease-detector', feature: 'disease-detector' },
      { title: t('Market Price'), emoji: '📈', color: 'bg-accent', route: '/market-trends', feature: 'market-trends' },
      { title: t('Gov Schemes'), emoji: '🏛️', color: 'bg-farm-leaf', route: '/government-schemes', feature: 'government-schemes' },
      
      { title: t('Crop Recommendation'), emoji: '🌱', color: 'bg-blue-500', route: '/crop-recommendation', feature: 'crop-recommendation' },
      { title: t('Cold Storage'), emoji: '❄️', color: 'bg-teal-500', route: '/cold-storage', feature: 'cold-storage' },
      { title: t('Community'), emoji: '🧑‍🤝‍🧑', color: 'bg-yellow-500', route: '/community', feature: 'community' },
      { title: t('Grocery Market'), emoji: '🛒', color: 'bg-green-500', route: '/grocery-marketplace', feature: 'grocery-marketplace' }
    ];
    return allQuickActions.filter(action => hasFeatureAccess(action.feature));
  }, [t, hasFeatureAccess, currentPlan]);

  const handleQuickAction = (route: string, feature: string) => {
    if (hasFeatureAccess(feature)) {
      navigate(route);
    }
  };

  const marketData = [
    {
      crop: 'Tomato',
      price: '₹45/kg',
      change: '+12%',
      trend: 'up'
    },
    {
      crop: 'Onion',
      price: '₹32/kg',
      change: '-8%',
      trend: 'down'
    },
    {
      crop: 'Potato',
      price: '₹28/kg',
      change: '+5%',
      trend: 'up'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Low Soil Moisture',
      description: 'Field 2 requires irrigation within 24 hours',
      time: '2 hours ago'
    },
    {
      type: 'info',
      title: 'Weather Forecast',
      description: 'Light rain expected tomorrow afternoon',
      time: '4 hours ago'
    },
    {
      type: 'success',
      title: 'Harvest Ready',
      description: 'Wheat crop in Field 1 is ready for harvest',
      time: '6 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <h1 className="text-hero text-primary font-indian mb-4">
          🌾 {t('Welcome, Farmer!')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('Digital Farming Assistant')}
        </p>
        <p className="text-sm text-secondary mt-2">
          {t('Monitor your crops')} • {t('Get AI insights')} • {t('Maximize your harvest')}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            whileHover={{ 
              scale: 1.05,
              rotate: [0, -1, 1, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer ${!hasFeatureAccess(action.feature) ? 'opacity-50' : ''}`}
            onClick={() => handleQuickAction(action.route, action.feature)}
          >
            <Card className="text-center p-4 hover:shadow-glow hover:bg-gradient-to-br hover:from-background hover:to-accent/5 transition-all duration-300 group">
              <motion.div 
                className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2 text-white text-xl group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {action.emoji}
              </motion.div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {action.title}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Weather Daily Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <h2 className="text-section-title text-primary font-indian flex items-center gap-2">
            🌤️ {t('Weather Daily Forecast')}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sun className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </h2>
          <motion.button
            onClick={refetch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sun className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="mt-2 text-muted-foreground">{t('Loading weather data...')}</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-muted-foreground">{t(error)}</p>
          </motion.div>
        )}

        {weatherData && !loading && (
          <>
            {/* Today's Weather Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg font-indian text-primary">{t("Today's Weather")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Temperature */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      </motion.div>
                      <motion.div
                        key={weatherData.current.temp}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-2xl font-bold text-primary"
                      >
                        {weatherData.current.temp}°C
                      </motion.div>
                       <p className="text-sm text-muted-foreground">{t('Temperature')}</p>
                    </motion.div>

                    {/* Light Intensity */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          opacity: [0.6, 1, 0.6],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.lightIntensity} lux
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Light Intensity')}</p>
                    </motion.div>

                    {/* Humidity */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -3, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.humidity}%
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Humidity')}</p>
                    </motion.div>

                    {/* Weather Condition */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {weatherData.current.condition === 'sunny' && <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />}
                        {weatherData.current.condition === 'partly-cloudy' && <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-500" />}
                        {weatherData.current.condition === 'cloudy' && <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-600" />}
                        {weatherData.current.condition === 'rainy' && <CloudRain className="h-8 w-8 mx-auto mb-2 text-blue-600" />}
                        {weatherData.current.condition === 'stormy' && <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />}
                        {weatherData.current.condition === 'snowy' && <CloudSnow className="h-8 w-8 mx-auto mb-2 text-blue-300" />}
                      </motion.div>
                      <div className="text-lg font-medium text-primary capitalize">
                        {t(weatherData.current.description)}
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Condition')}</p>
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {/* Wind Speed */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 5, 
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Wind className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.windSpeed} km/h
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Wind Speed')}</p>
                    </motion.div>

                    {/* Pressure */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -2, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Gauge className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.pressure} hPa
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Pressure')}</p>
                    </motion.div>

                    {/* Cloud Cover */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.cloudCover}%
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Cloud Cover')}</p>
                    </motion.div>

                    {/* Visibility */}
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -2, 0]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Eye className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      </motion.div>
                      <div className="text-2xl font-bold text-primary">
                        {weatherData.current.visibility} km
                      </div>
                      <p className="text-sm text-muted-foreground">{t('Visibility')}</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 7-Day Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-indian text-primary mb-4">7-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {weatherData.forecast.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -5,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="text-center hover:shadow-elegant hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-accent/5">
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-primary mb-2">
                          {day.day}
                        </div>
                        
                        <motion.div
                          whileHover={{ 
                            scale: 1.2,
                            rotate: [0, -10, 10, 0]
                          }}
                          transition={{ duration: 0.3 }}
                          className="mb-3"
                        >
                          {day.condition === 'sunny' && <Sun className="h-6 w-6 mx-auto text-yellow-500" />}
                          {day.condition === 'partly-cloudy' && <Cloud className="h-6 w-6 mx-auto text-gray-500" />}
                          {day.condition === 'cloudy' && <Cloud className="h-6 w-6 mx-auto text-gray-600" />}
                          {day.condition === 'rainy' && <CloudRain className="h-6 w-6 mx-auto text-blue-600" />}
                          {day.condition === 'stormy' && <Zap className="h-6 w-6 mx-auto text-purple-500" />}
                          {day.condition === 'snowy' && <CloudSnow className="h-6 w-6 mx-auto text-blue-300" />}
                        </motion.div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{day.temp.max}°</span>
                            <span className="text-muted-foreground">{day.temp.min}°</span>
                          </div>
                          {day.precipitation > 0 && (
                            <div className="text-xs text-blue-600">
                              ☔ {day.precipitation}%
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 capitalize">
                          {day.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Market Prices & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Prices */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">
                📈 Today's Market Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketData.map((item, index) => (
                <motion.div
                  key={item.crop}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.crop}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.price}</p>
                    <div className="flex items-center space-x-1">
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        item.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <Button className="w-full mt-4 bg-accent hover:bg-accent/90">
                View All Prices
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">
                🔔 Farm Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                    alert.type === 'success' ? 'bg-green-50 border-green-400' :
                    alert.type === 'info' ? 'bg-blue-50 border-blue-400' :
                    'bg-gray-50 border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {alert.time}
                    </span>
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};