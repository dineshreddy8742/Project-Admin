import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Leaf,
  Beaker,
  Search,
  Calendar,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/contexts/language-utils';
import eventBus from '@/lib/eventBus';

const CropRecommendation = () => {
  const { toast } = useToast();
  
  const { currentLanguage } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState('recommendation');
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    season: 'Spring'
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [cropSchedule, setCropSchedule] = useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionData = await apiService.startSession('user-crop-rec', currentLanguage.code);
        setSessionId(sessionData.session_id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not connect to the agent.",
          variant: "destructive"
        });
      }
    };
    initSession();
  }, [currentLanguage.code, toast]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [target.id]: target.value }));
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, season: value }));
  }, []);

  const recommendCrop = useCallback(async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session not initialized. Please refresh.",
        variant: "destructive"
      });
      return;
    }

    for (const [key, value] of Object.entries(formData)) {
      if (value === '') {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${key} field.`,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    setRecommendation(null);

    try {
      const userInput = `N=${formData.N}, P=${formData.P}, K=${formData.K}, temp=${formData.temperature}, humidity=${formData.humidity}, ph=${formData.ph}, rainfall=${formData.rainfall}, season=${formData.season}`;
      
      const result = await apiService.executeTask(
        sessionId,
        'crop_recommendation',
        userInput,
        null
      );

      const recommendationAction = result.actions.find(a => a.action === 'complete_task');

      if (recommendationAction && recommendationAction.summary) {
        setRecommendation({ recommended_crop: recommendationAction.summary });
        toast({
          title: "Recommendation Successful",
          description: `We recommend planting ${recommendationAction.summary}.`
        });
      } else {
        throw new Error("Failed to get a valid recommendation from the agent.");
      }
    } catch (error: any) {      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, formData, toast, currentLanguage.code]);

  const handleScheduleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Missing information",
        description: "Please enter a crop name",
        variant: "destructive"
      });
      return;
    }

    setScheduleLoading(true);
    setTimeout(() => {
      const schedule = getCropPlan(searchQuery.toLowerCase());
      setCropSchedule(schedule);
      setScheduleLoading(false);
      toast({
        title: "Schedule retrieved",
        description: `Displaying schedule for ${searchQuery}`
      });
    }, 1500);
  };

  const getCropPlan = (cropName: string) => {
    const plans: Record<string, any> = {
      wheat: {
        timeline: [
          { phase: 'Land Preparation', duration: '15-20 days', activity: 'Plowing, harrowing, leveling' },
          { phase: 'Sowing', duration: '7-10 days', activity: 'Seed sowing with proper spacing' },
        ],
        treatments: [
          { type: 'Basal Fertilizer', timing: 'At sowing', application: 'NPK 120:60:40 kg/hectare' },
        ],
        yield: '40-45 Q/Ha',
        revenue: '₹80,000-₹90,000/Ha',
        tips: [
          'Maintain soil moisture during critical growth stages',
        ]
      },
      rice: {
        timeline: [
            { phase: 'Nursery Preparation', duration: '25-30 days', activity: 'Seed bed preparation and sowing' },
        ],
        treatments: [
            { type: 'Basal Fertilizer', timing: 'Before transplanting', application: 'NPK 120:60:40 kg/hectare' },
        ],
        yield: '60-70 Q/Ha',
        revenue: '₹1,20,000-₹1,40,000/Ha',
        tips: [
            'Maintain 2-5 cm water level throughout growth',
        ]
      },
      tomato: {
        timeline: [
            { phase: 'Nursery', duration: '25-30 days', activity: 'Seed sowing in protected conditions' },
        ],
        treatments: [
            { type: 'Organic Manure', timing: 'Land preparation', application: '25-30 tonnes FYM/hectare' },
        ],
        yield: '500-600 Q/Ha',
        revenue: '₹3,00,000-₹4,50,000/Ha',
        tips: [
            'Provide support stakes within 15 days of transplanting',
        ]
      }
    };
    return plans[cropName] || plans.wheat;
  };

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: string }) => {
      if (field === 'season') {
        handleSelectChange(value);
      } else {
        const event = { target: { id: field, value } } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(event);
      }
    };

    const handleGetRecommendation = () => recommendCrop();

    eventBus.on('autofill-field', handleFillField);
    eventBus.on('fill-recommendation-field', handleFillField);
    eventBus.on('submit-form', handleGetRecommendation);
    eventBus.on('get-recommendation', handleGetRecommendation);

    return () => {
      eventBus.remove('autofill-field', handleFillField);
      eventBus.remove('fill-recommendation-field', handleFillField);
      eventBus.remove('submit-form', handleGetRecommendation);
      eventBus.remove('get-recommendation', handleGetRecommendation);
    };
  }, [handleInputChange, handleSelectChange, recommendCrop]);

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-700 mb-2 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Leaf className="h-10 w-10" />
            Crop Recommendation & Scheduling
          </h1>
        </motion.div>

        <Tabs value={activeMode} onValueChange={(mode) => setActiveMode(mode as string)} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
            <TabsTrigger value="recommendation" className="text-sm md:text-lg font-medium">
              <Search className="h-5 w-5 mr-2" />
              Crop Recommendation
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="text-sm md:text-lg font-medium">
              <Calendar className="h-5 w-5 mr-2" />
              Crop Scheduling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-6 w-6" />
                    Soil & Environmental Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="N">🧪 Nitrogen (N)</Label>
                      <Input id="N" type="number" value={formData.N} onChange={handleInputChange} placeholder="e.g. 90" />
                    </div>
                    <div>
                      <Label htmlFor="P">🧪 Phosphorus (P)</Label>
                      <Input id="P" type="number" value={formData.P} onChange={handleInputChange} placeholder="e.g. 40" />
                    </div>
                    <div>
                      <Label htmlFor="K">🧪 Potassium (K)</Label>
                      <Input id="K" type="number" value={formData.K} onChange={handleInputChange} placeholder="e.g. 43" />
                    </div>
                    <div>
                      <Label htmlFor="temperature">🌡 Temperature (°C)</Label>
                      <Input id="temperature" type="number" value={formData.temperature} onChange={handleInputChange} placeholder="e.g. 25.6" />
                    </div>
                    <div>
                      <Label htmlFor="humidity">💧 Humidity (%)</Label>
                      <Input id="humidity" type="number" value={formData.humidity} onChange={handleInputChange} placeholder="e.g. 80" />
                    </div>
                    <div>
                      <Label htmlFor="ph">🌱 Soil pH</Label>
                      <Input id="ph" type="number" value={formData.ph} onChange={handleInputChange} placeholder="e.g. 6.5" />
                    </div>
                    <div>
                      <Label htmlFor="rainfall">🌧 Rainfall (mm)</Label>
                      <Input id="rainfall" type="number" value={formData.rainfall} onChange={handleInputChange} placeholder="e.g. 200" />
                    </div>
                    <div>
                      <Label htmlFor="season">🍂 Season</Label>
                      <Select onValueChange={handleSelectChange} defaultValue={formData.season}>
                        <SelectTrigger id="season">
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                          <SelectItem value="Autumn">Autumn</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Monsoon">Monsoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={recommendCrop} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} 
                    Get Recommendation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Recommendation Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                      <span className="ml-2">Analyzing...</span>
                    </div>
                  ) : recommendation ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">Recommended Crop</p>
                        <p className="text-3xl font-bold text-green-600">{recommendation.recommended_crop}</p>
                        <Badge>{recommendation.confidence} Confidence</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Soil Analysis</h4>
                          <p>N: {recommendation.soil_analysis.nitrogen}</p>
                          <p>P: {recommendation.soil_analysis.phosphorus}</p>
                          <p>K: {recommendation.soil_analysis.potassium}</p>
                          <p>pH: {recommendation.soil_analysis.ph_level}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Weather Conditions</h4>
                          <p>Temp: {recommendation.weather_conditions.temperature}°C</p>
                          <p>Humidity: {recommendation.weather_conditions.humidity}%</p>
                          <p>Rainfall: {recommendation.weather_conditions.rainfall}mm</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Enter soil and weather data to get a crop recommendation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduling">
            <Card>
              <CardHeader>
                <CardTitle>Search Crop Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="e.g., Wheat, Rice, Tomato"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" onClick={handleScheduleSearch} disabled={scheduleLoading}>
                    {scheduleLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} 
                    Search
                  </Button>
                </div>

                {scheduleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                    <span className="ml-2">Fetching schedule...</span>
                  </div>
                ) : cropSchedule ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                    <h3 className="text-xl font-semibold">Schedule for {searchQuery}</h3>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Timeline</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {cropSchedule.timeline.map((item: any, index: number) => (
                          <li key={index}><strong>{item.phase}</strong> ({item.duration}): {item.activity}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Treatments</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {cropSchedule.treatments.map((item: any, index: number) => (
                          <li key={index}><strong>{item.type}</strong> ({item.timing}): {item.application}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Yield & Revenue</h4>
                      <p><strong>Yield:</strong> {cropSchedule.yield}</p>
                      <p><strong>Revenue:</strong> {cropSchedule.revenue}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Tips</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {cropSchedule.tips.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Search for a crop to see its detailed schedule.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CropRecommendation;
