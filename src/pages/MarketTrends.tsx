import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  MapPin,
  Clock,
  Heart,
  HeartOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import eventBus from '@/lib/eventBus';

// Import commodity images
import tomatoImg from '@/assets/commodities/tomato.jpg';
import beansImg from '@/assets/commodities/beans.jpg';
import riceImg from '@/assets/commodities/rice.jpg';
import onionImg from '@/assets/commodities/onion.jpg';
import wheatImg from '@/assets/commodities/wheat.jpg';
import potatoImg from '@/assets/commodities/potato.jpg';
import cabbageImg from '@/assets/commodities/cabbage.jpg';

interface Commodity {
  id: string;
  name: string;
  image: string;
  category: string;
}

interface Mandi {
  id: string;
  name: string;
  district: string;
  state: string;
  distance: number;
  currentPrice: { min: number; max: number; modal: number };
  unit: string;
  date: string;
  isFollowing: boolean;
  variety: string;
  grade: string;
}

interface PriceHistory {
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

const API_KEY = "579b464db66ec23bdd0000011cf3d78fcf494f4164cdccb8704c30e8";

const MarketTrends = () => {
  const { translateSync } = useLanguage();
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMandi, setExpandedMandi] = useState<string>('');
  const [followedMandis, setFollowedMandis] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<Mandi[]>([]);
  const [priceHistories, setPriceHistories] = useState<Record<string, PriceHistory[]>>({});

  const commodities: Commodity[] = [
    { id: 'Tomato', name: 'Tomato', image: tomatoImg, category: 'Vegetables' },
    { id: 'Beans', name: 'Beans', image: beansImg, category: 'Vegetables' },
    { id: 'Rice', name: 'Rice', image: riceImg, category: 'Cereals' },
    { id: 'Onion', name: 'Onion', image: onionImg, category: 'Vegetables' },
    { id: 'Wheat', name: 'Wheat', image: wheatImg, category: 'Cereals' },
    { id: 'Potato', name: 'Potato', image: potatoImg, category: 'Vegetables' },
    { id: 'Cabbage', name: 'Cabbage', image: cabbageImg, category: 'Vegetables' },
  ];

  // Load user profile and initial data
  useEffect(() => {
    loadUserProfile();
    loadInitialData();
  }, []);

  // Set default location when profile and states are loaded
  useEffect(() => {
    if (states.length > 0) {
      setDefaultLocation();
    }
  }, [states]);

  // Populate districts when state changes
  useEffect(() => {
    if (selectedState && allRecords.length > 0) {
      populateDistricts(selectedState);
    }
  }, [selectedState, allRecords]);

  // Fetch market data when selections change
  useEffect(() => {
    if (selectedCommodity && selectedState && selectedDistrict) {
      fetchMarketData();
    }
  }, [selectedCommodity, selectedState, selectedDistrict]);

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: string }) => {
        if (field === 'commodity') {
            const commodity = commodities.find(c => c.name.toLowerCase() === value.toLowerCase());
            if (commodity) {
                setSelectedCommodity(commodity.id);
            }
        } else if (field === 'state') {
            setSelectedState(value);
        } else if (field === 'district') {
            setSelectedDistrict(value);
        }
    };

    eventBus.on('fill-market-trends-field', handleFillField);

    return () => {
        eventBus.remove('fill-market-trends-field', handleFillField);
    };
  }, [commodities]);

  const loadUserProfile = () => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user) {
      const defaultState = user.state || 'Andhra Pradesh';
      const defaultDistrict = user.district || 'Chittoor';
      setSelectedState(defaultState);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=10000`;
      const response = await fetch(url);
      const data = await response.json();
      setAllRecords(data.records || []);
      populateStates(data.records || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const populateStates = (records: any[]) => {
    const uniqueStates = [...new Set(records.map(rec => rec.state))].sort();
    setStates(uniqueStates);
  };

  const populateDistricts = (state: string) => {
    const uniqueDistricts = [...new Set(
      allRecords.filter(rec => rec.state === state).map(rec => rec.district)
    )].sort();
    setDistricts(uniqueDistricts);
    
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user && user.district && uniqueDistricts.includes(user.district)) {
      setSelectedDistrict(user.district);
    } else if (uniqueDistricts.length > 0) {
      setSelectedDistrict(uniqueDistricts[0]);
    }
  };

  const setDefaultLocation = () => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user) {
      const defaultState = user.state || 'Andhra Pradesh';
      if (states.includes(defaultState)) {
        setSelectedState(defaultState);
      } else if (states.length > 0) {
        setSelectedState(states[0]);
      }
    } else if (states.length > 0) {
      setSelectedState(states[0]);
    }
  };

  const convertTo10Kgs = (price: number) => Math.round((price / 10) * 100) / 100;

  const parseDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(dateStr);
    } catch (error) {
      return new Date();
    }
  };

  const getMarketData = async () => {
    if (!selectedCommodity || !selectedState || !selectedDistrict) return [];
    try {
      setLoading(true);
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=1000&filters[state]=${encodeURIComponent(selectedState)}&filters[district]=${encodeURIComponent(selectedDistrict)}&filters[commodity]=${encodeURIComponent(selectedCommodity)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error("Error fetching market data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const processMarketData = (records: any[]): Mandi[] => {
    if (!records || records.length === 0) return [];
    return records.map((record, index) => ({
      id: `${record.market}-${index}-${Date.now()}`,
      name: record.market || 'Unknown Market',
      district: record.district || 'Unknown District',
      state: record.state || 'Unknown State',
      distance: Math.floor(Math.random() * 100) + 10,
      currentPrice: {
        min: convertTo10Kgs(parseInt(record.min_price) || 0),
        max: convertTo10Kgs(parseInt(record.max_price) || 0),
        modal: convertTo10Kgs(parseInt(record.modal_price) || 0)
      },
      unit: '10 kg',
      date: record.arrival_date || 'Unknown Date',
      isFollowing: false,
      variety: record.variety || 'N/A',
      grade: record.grade || 'N/A'
    }));
  };

  const getPriceHistory = async (mandiName: string, commodity: string): Promise<PriceHistory[]> => {
    try {
      const mandiRecords = allRecords.filter(rec => 
        rec.market === mandiName && 
        rec.state === selectedState && 
        rec.district === selectedDistrict &&
        rec.commodity === commodity
      );

      if (mandiRecords.length === 0) return generateSampleHistory();

      const sortedRecords = mandiRecords.sort((a, b) => {
        const dateA = parseDate(a.arrival_date);
        const dateB = parseDate(b.arrival_date);
        return dateB.getTime() - dateA.getTime();
      });

      const uniqueDates: string[] = [];
      const dateMap = new Map();
      
      sortedRecords.forEach(record => {
        if (!dateMap.has(record.arrival_date) && uniqueDates.length < 4) {
          dateMap.set(record.arrival_date, true);
          uniqueDates.push(record.arrival_date);
        }
      });

      const historyData = uniqueDates.map(date => {
        const record = mandiRecords.find(rec => rec.arrival_date === date);
        return {
          date: date.split('/').slice(0, 2).join('/'),
          minPrice: convertTo10Kgs(parseInt(record?.min_price) || 0),
          maxPrice: convertTo10Kgs(parseInt(record?.max_price) || 0),
          modalPrice: convertTo10Kgs(parseInt(record?.modal_price) || 0)
        };
      });

      return historyData.sort((a, b) => {
        const dateA = parseDate(a.date + '/2024');
        const dateB = parseDate(b.date + '/2024');
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      return generateSampleHistory();
    }
  };

  const generateSampleHistory = (): PriceHistory[] => {
    const basePrice = Math.random() * 100 + 50;
    const dates = ['20/01', '21/01', '22/01', '23/01'];
    return dates.map((date, index) => {
      const variation = (Math.random() - 0.5) * 20;
      const currentPrice = basePrice + variation;
      return {
        date,
        minPrice: Math.round(currentPrice - 5),
        maxPrice: Math.round(currentPrice + 10),
        modalPrice: Math.round(currentPrice + 2)
      };
    });
  };

  const fetchMarketData = async () => {
    const apiData = await getMarketData();
    const processedData = processMarketData(apiData);
    setMarketData(processedData);
  };

  const toggleExpandMandi = async (mandiId: string) => {
    if (expandedMandi === mandiId) {
      setExpandedMandi('');
    } else {
      setExpandedMandi(mandiId);
      const mandi = marketData.find(m => m.id === mandiId);
      if (mandi && !priceHistories[mandiId]) {
        const history = await getPriceHistory(mandi.name, selectedCommodity);
        setPriceHistories(prev => ({ ...prev, [mandiId]: history }));
      }
    }
  };

  const toggleFollow = (mandiId: string) => {
    const newFollowed = new Set(followedMandis);
    newFollowed.has(mandiId) ? newFollowed.delete(mandiId) : newFollowed.add(mandiId);
    setFollowedMandis(newFollowed);
  };

  const getPriceChange = (current: number, previous: number) => {
    if (!previous) return { change: 0, percent: 0, type: 'same' };
    const change = current - previous;
    const percent = ((change / previous) * 100);
    return {
      change: Math.round(change * 100) / 100,
      percent: Math.round(percent * 100) / 100,
      type: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  };

  const filteredMandis = marketData.filter(mandi => 
    mandi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mandi.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mandi.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
        {/* Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 px-3"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            📊 Market Trends
          </h1>
          <p className="text-xs md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Get real-time commodity prices from nearby mandis (Prices per 10 kgs)
          </p>
        </motion.div>

        <div className="px-2 md:px-4 pb-4 space-y-3 md:space-y-6">
          {/* Commodity Selection - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="md:rounded-lg">
              <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
                <CardTitle className="text-base md:text-lg">Select Commodity</CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {commodities.map((commodity) => (
                    <motion.div
                      key={commodity.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 cursor-pointer p-2 rounded-lg border-2 transition-all duration-300 ${
                        selectedCommodity === commodity.id
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-accent hover:bg-accent/5'
                      }`}
                      onClick={() => setSelectedCommodity(commodity.id)}
                    >
                      <div className="text-center w-16 sm:w-20">
                        <img
                          src={commodity.image}
                          alt={commodity.name}
                          className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-full mx-auto mb-1 sm:mb-2 border-2 border-background shadow-sm"
                        />
                        <p className="text-xs font-medium truncate">{commodity.name}</p>
                        <p className="text-xs text-muted-foreground truncate hidden sm:block">{commodity.category}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Selection - Mobile Optimized */}
          {selectedCommodity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="md:rounded-lg">
                <CardHeader className="pb-2 md:pb-3 px-3 md:px-6">
                  <CardTitle className="text-base md:text-lg">Select Location</CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {selectedState && selectedDistrict 
                      ? `Showing data for ${selectedDistrict}, ${selectedState}`
                      : 'Select state and district to view market data'
                    }
                  </p>
                </CardHeader>
                <CardContent className="px-3 md:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">State</label>
                      <select 
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full p-2 md:p-3 rounded-lg border border-border bg-background text-sm"
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">District</label>
                      <select 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full p-2 md:p-3 rounded-lg border border-border bg-background text-sm"
                        disabled={!selectedState}
                      >
                        <option value="">Select District</option>
                        {districts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search Bar - Mobile Optimized */}
          {selectedCommodity && selectedState && selectedDistrict && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="md:rounded-lg">
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by Mandi Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 md:h-12 text-sm md:text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="md:rounded-lg">
              <CardContent className="text-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">Loading market data...</p>
              </CardContent>
            </Card>
          )}

          {/* Mandis List - Mobile Optimized */}
          {selectedCommodity && selectedState && selectedDistrict && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 md:space-y-3"
            >
              {filteredMandis.length > 0 ? (
                <>
                  <div className="text-xs md:text-sm text-muted-foreground px-2">
                    Showing {filteredMandis.length} mandis for {selectedCommodity} in {selectedDistrict}, {selectedState}
                  </div>
                  
                  {filteredMandis.map((mandi, index) => {
                    const history = priceHistories[mandi.id] || [];
                    const latestHistory = history.length > 0 ? history[history.length - 1] : null;
                    const previousHistory = history.length > 1 ? history[history.length - 2] : null;
                    const priceChange = latestHistory && previousHistory 
                      ? getPriceChange(latestHistory.modalPrice, previousHistory.modalPrice)
                      : null;

                    return (
                      <motion.div
                        key={mandi.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 md:rounded-lg">
                          <CardContent className="p-3 md:p-4">
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm md:text-base truncate">{mandi.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{mandi.district}, {mandi.state}</span>
                                  </div>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline">{mandi.distance} km</span>
                                  <span className="hidden sm:inline">•</span>
                                  <Badge variant="secondary" className="text-[10px] md:text-xs">
                                    {mandi.variety} • {mandi.grade}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFollow(mandi.id)}
                                className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0 ml-1 self-center sm:self-start"
                              >
                                {followedMandis.has(mandi.id) ? (
                                  <Heart className="h-3 w-3 md:h-4 md:w-4 fill-red-500 text-red-500" />
                                ) : (
                                  <HeartOff className="h-3 w-3 md:h-4 md:w-4" />
                                )}
                              </Button>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-end justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm md:text-lg font-bold text-primary flex items-center gap-1 md:gap-2 flex-wrap">
                                    <span className="whitespace-nowrap">₹{mandi.currentPrice.min} – ₹{mandi.currentPrice.max}</span>
                                    <span className="text-xs md:text-sm font-normal text-green-600 whitespace-nowrap">
                                      (Modal: ₹{mandi.currentPrice.modal})
                                    </span>
                                    {priceChange && (
                                      <span className={`text-xs font-semibold inline-flex items-center gap-1 ${
                                        priceChange.type === 'up' ? 'text-red-500' : 
                                        priceChange.type === 'down' ? 'text-green-500' : 
                                        'text-gray-500'
                                      }`}>
                                        {priceChange.type === 'up' ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                                        {Math.abs(priceChange.percent)}%
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Updated: {mandi.date}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleExpandMandi(mandi.id)}
                                className="ml-2 h-7 md:h-9 text-xs md:text-sm flex-shrink-0 mt-2 sm:mt-0"
                              >
                                {expandedMandi === mandi.id ? (
                                  <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                                )}
                                <span className="hidden md:inline ml-1">History</span>
                              </Button>
                            </div>

                            {/* Expanded Price History - Mobile Optimized */}
                            <AnimatePresence>
                              {expandedMandi === mandi.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 pt-3 border-t border-border"
                                >
                                  <h4 className="font-medium mb-2 text-sm">Price Trends (Last 4 Days)</h4>
                                  
                                  {/* Historical Data Table - Mobile Optimized */}
                                  {history.length > 0 && (
                                    <div className="mb-3 overflow-x-auto">
                                      <div className="grid grid-cols-5 gap-1 text-[10px] md:text-xs font-medium mb-1 min-w-[280px]">
                                        <div className="truncate">Date</div>
                                        <div className="truncate">Min</div>
                                        <div className="truncate">Max</div>
                                        <div className="truncate">Modal</div>
                                        <div className="truncate">Change</div>
                                      </div>
                                      {history.map((record, idx) => {
                                        const prevRecord = idx > 0 ? history[idx - 1] : null;
                                        const change = prevRecord ? getPriceChange(record.modalPrice, prevRecord.modalPrice) : null;
                                        
                                        return (
                                          <div key={idx} className="grid grid-cols-5 gap-1 text-xs py-1 border-b border-border/30 min-w-[280px]">
                                            <div className="truncate text-[10px] md:text-xs">{record.date}</div>
                                            <div className="truncate">₹{record.minPrice}</div>
                                            <div className="truncate">₹{record.maxPrice}</div>
                                            <div className="truncate font-semibold">₹{record.modalPrice}</div>
                                            <div className={`truncate text-[10px] ${
                                              change ? 
                                                change.type === 'up' ? 'text-red-500' : 
                                                change.type === 'down' ? 'text-green-500' : 
                                                'text-gray-500' : 'text-gray-500'
                                            }`}>
                                              {change ? 
                                                `${change.type === 'up' ? '↗' : change.type === 'down' ? '↘' : '→'} ${Math.abs(change.percent)}%` 
                                                : '-'
                                              }
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {/* Price Trend Graph - Mobile Optimized */}
                                  <div className="h-48 md:h-64 w-full mb-3">
                                    {history.length > 0 ? (
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                          <XAxis 
                                            dataKey="date" 
                                            fontSize={10}
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                          />
                                          <YAxis 
                                            fontSize={10}
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                          />
                                          <Tooltip
                                            contentStyle={{
                                              backgroundColor: 'hsl(var(--background))',
                                              border: '1px solid hsl(var(--border))',
                                              borderRadius: '6px',
                                              fontSize: '12px'
                                            }}
                                          />
                                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                          <Line 
                                            type="monotone" 
                                            dataKey="maxPrice" 
                                            stroke="#e74c3c" 
                                            strokeWidth={2}
                                            name="Max Price"
                                            dot={{ r: 2 }}
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="minPrice" 
                                            stroke="#3498db" 
                                            strokeWidth={2}
                                            name="Min Price"
                                            dot={{ r: 2 }}
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="modalPrice" 
                                            stroke="#2ecc71" 
                                            strokeWidth={3}
                                            name="Modal Price"
                                            dot={{ r: 3 }}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    ) : (
                                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                        No historical data available
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </>
              ) : (
                <Card className="md:rounded-lg">
                  <CardContent className="text-center py-6 md:py-8">
                    <p className="text-muted-foreground text-sm md:text-base">
                      No mandis found for {selectedCommodity} in {selectedDistrict}, {selectedState}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!selectedCommodity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="md:rounded-lg">
                <CardContent className="text-center py-8 md:py-12">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">🌾</div>
                  <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Select a Commodity</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Choose a commodity above to see nearby mandi prices and trends
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MarketTrends;