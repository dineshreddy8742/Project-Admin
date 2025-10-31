import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Eye, ShoppingCart, Heart, MapPin, Clock, Loader2 } from 'lucide-react';
import { apiService } from '@/services/apiService';

const CustomerBehaviorInsights = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [behaviorData, setBehaviorData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>({});
  const [regionData, setRegionData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced with real data from API
  const mockRegionData = [
    { name: 'Tamil Nadu', visitors: 4500 },
    { name: 'Uttar Pradesh', visitors: 3800 },
    { name: 'Maharashtra', visitors: 3200 },
    { name: 'Gujarat', visitors: 2900 },
    { name: 'West Bengal', visitors: 2500 },
    { name: 'Rajasthan', visitors: 2200 },
    { name: 'Karnataka', visitors: 2000 },
    { name: 'Kerala', visitors: 1800 },
    { name: 'Punjab', visitors: 1500 },
    { name: 'Bihar', visitors: 1300 },
  ];

  const mockDeviceData = [
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 25 },
    { name: 'Tablet', value: 10 },
  ];

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would get the artisan ID from context or props
        // For now we're using a placeholder ID
        const artisanId = 'artisan-placeholder-id';
        
        // For now, we'll use the same API call as sales analytics since customer behavior data
        // would be part of the same analytics system in the backend
        const response = await apiService.getCustomerBehaviorInsights(artisanId, timeRange);
        
        if (response.success) {
          // Process the API response
          const data = response.behavior_data || [];
          setBehaviorData(data);
          
          // Calculate insights from API data
          const totalPageViews = data.reduce((sum: number, day: any) => sum + day.pageViews, 0);
          const totalUniqueVisitors = data.reduce((sum: number, day: any) => sum + day.uniqueVisitors, 0);
          const avgBounceRate = data.reduce((sum: number, day: any) => sum + day.bounceRate, 0) / (data.length || 1);
          const avgTimeSpent = data.reduce((sum: number, day: any) => sum + day.avgTime, 0) / (data.length || 1);
          
          setInsights({
            totalPageViews,
            totalUniqueVisitors,
            avgBounceRate: avgBounceRate.toFixed(1),
            avgTimeSpent: Math.round(avgTimeSpent),
            growth: 18.5 // This would come from API in a real implementation
          });
        } else {
          // Fallback to mock data if API fails
          console.warn('API response failed, using mock data');
          
          // Mock customer behavior data
          const mockBehaviorData = [
            { date: '2024-01-01', pageViews: 1250, uniqueVisitors: 850, bounceRate: 42, avgTime: 125 },
            { date: '2024-01-02', pageViews: 1420, uniqueVisitors: 980, bounceRate: 38, avgTime: 156 },
            { date: '2024-01-03', pageViews: 1100, uniqueVisitors: 720, bounceRate: 45, avgTime: 110 },
            { date: '2024-01-04', pageViews: 1650, uniqueVisitors: 1120, bounceRate: 35, avgTime: 187 },
            { date: '2024-01-05', pageViews: 1820, uniqueVisitors: 1250, bounceRate: 32, avgTime: 210 },
            { date: '2024-01-06', pageViews: 2100, uniqueVisitors: 1450, bounceRate: 28, avgTime: 245 },
            { date: '2024-01-07', pageViews: 1980, uniqueVisitors: 1380, bounceRate: 30, avgTime: 220 },
            { date: '2024-01-08', pageViews: 2250, uniqueVisitors: 1520, bounceRate: 26, avgTime: 265 },
            { date: '2024-01-09', pageViews: 1870, uniqueVisitors: 1280, bounceRate: 31, avgTime: 205 },
            { date: '2024-01-10', pageViews: 2340, uniqueVisitors: 1620, bounceRate: 24, avgTime: 280 },
            { date: '2024-01-11', pageViews: 2120, uniqueVisitors: 1450, bounceRate: 27, avgTime: 235 },
            { date: '2024-01-12', pageViews: 2480, uniqueVisitors: 1750, bounceRate: 22, avgTime: 295 },
            { date: '2024-01-13', pageViews: 1960, uniqueVisitors: 1350, bounceRate: 30, avgTime: 215 },
            { date: '2024-01-14', pageViews: 2650, uniqueVisitors: 1850, bounceRate: 20, avgTime: 310 },
          ];
          
          setBehaviorData(mockBehaviorData);
          
          // Calculate insights from mock data
          const totalPageViews = mockBehaviorData.reduce((sum, day) => sum + day.pageViews, 0);
          const totalUniqueVisitors = mockBehaviorData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
          const avgBounceRate = mockBehaviorData.reduce((sum, day) => sum + day.bounceRate, 0) / mockBehaviorData.length;
          const avgTimeSpent = mockBehaviorData.reduce((sum, day) => sum + day.avgTime, 0) / mockBehaviorData.length;
          
          setInsights({
            totalPageViews,
            totalUniqueVisitors,
            avgBounceRate: avgBounceRate.toFixed(1),
            avgTimeSpent: Math.round(avgTimeSpent),
            growth: 18.5 // Mock growth percentage
          });
        }
      } catch (error) {
        console.error('Error fetching behavior data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load customer behavior insights',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBehaviorData();
  }, [timeRange]);

  useEffect(() => {
    // In a real implementation, this would come from the API
    setRegionData(mockRegionData);
    setDeviceData(mockDeviceData);
  }, [timeRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading customer insights...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full mr-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Customer Behavior Insights
            </h1>
            <p className="text-lg text-muted-foreground">
              Understand your customers' preferences and shopping patterns
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing customer insights for the last {timeRange.replace('d', ' days')}
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-background">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="14d">Last 14 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Total Page Views
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {insights.totalPageViews?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+{insights.growth}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Unique Visitors
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {insights.totalUniqueVisitors?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+22% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Bounce Rate
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {insights.avgBounceRate}%
            </div>
            <div className="flex items-center mt-1">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">-3% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Avg. Time Spent
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {insights.avgTimeSpent} sec
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Engagement Chart */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Customer Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <LineChart data={behaviorData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Page Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Unique Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bounce Rate and Time Spent */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Bounce Rate & Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <BarChart data={behaviorData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar 
                    yAxisId="left" 
                    dataKey="bounceRate" 
                    fill="#ef4444" 
                    name="Bounce Rate (%)"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="avgTime" 
                    fill="#8b5cf6" 
                    name="Avg. Time (sec)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <BarChart data={regionData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#f59e0b" name="Visitors">
                    {regionData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Device Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">
            Customer Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Top Regions</h3>
              </div>
              <ul className="space-y-2">
                {regionData.slice(0, 5).map((region, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{region.name}</span>
                    <Badge variant="outline">{region.visitors.toLocaleString('en-IN')}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Behavior Patterns</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 65% of visitors browse on mobile devices</li>
                <li>• Average session length is {insights.avgTimeSpent} seconds</li>
                <li>• Bounce rate has decreased by 3%</li>
                <li>• Tamil Nadu shows highest engagement</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Product Preferences</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Textiles account for 45% of sales</li>
                <li>• Peak browsing hours: 10AM - 12PM</li>
                <li>• Repeat customers: 32%</li>
                <li>• Wishlist additions: 8.2% conversion rate</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Mobile Optimization</h3>
              <p className="text-sm text-muted-foreground">
                With 65% of users on mobile, ensure your product listings are optimized for mobile viewing. 
                Focus on fast loading times and easy navigation.
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Regional Marketing</h3>
              <p className="text-sm text-muted-foreground">
                Focus marketing efforts on Tamil Nadu, Uttar Pradesh, and Maharashtra where you have the highest engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerBehaviorInsights;