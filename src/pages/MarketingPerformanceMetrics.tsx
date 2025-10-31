import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, IndianRupee, MessageCircle, Share2, Users, BarChart3, Filter, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const MarketingPerformanceMetrics = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
  const [marketingData, setMarketingData] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [roiData, setRoiData] = useState<any[]>([]);
  const [campaignBreakdown, setCampaignBreakdown] = useState<any[]>([]);

  // Mock marketing data
  const mockMarketingData = [
    { month: 'Jan', spend: 120000, impressions: 45000, clicks: 2800, conversions: 35, ctr: 6.2, cpc: 42.86, roas: 3.2 },
    { month: 'Feb', spend: 110000, impressions: 42000, clicks: 2600, conversions: 32, ctr: 6.1, cpc: 42.31, roas: 3.5 },
    { month: 'Mar', spend: 135000, impressions: 52000, clicks: 3200, conversions: 48, ctr: 6.2, cpc: 42.19, roas: 3.8 },
    { month: 'Apr', spend: 145000, impressions: 58000, clicks: 3600, conversions: 55, ctr: 6.2, cpc: 40.28, roas: 4.1 },
    { month: 'May', spend: 160000, impressions: 65000, clicks: 4200, conversions: 68, ctr: 6.5, cpc: 38.10, roas: 4.5 },
    { month: 'Jun', spend: 180000, impressions: 72000, clicks: 4800, conversions: 75, ctr: 6.7, cpc: 37.50, roas: 4.8 }
  ];

  const mockPerformanceMetrics = [
    { channel: 'Social Media', spend: 750000, revenue: 3200000, roas: 4.27, conversions: 385, cpa: 195 },
    { channel: 'Google Ads', spend: 520000, revenue: 2100000, roas: 4.04, conversions: 245, cpa: 212 },
    { channel: 'Email Marketing', spend: 180000, revenue: 850000, roas: 4.72, conversions: 150, cpa: 120 },
    { channel: 'Influencer', spend: 220000, revenue: 980000, roas: 4.45, conversions: 120, cpa: 183 },
    { channel: 'Content Marketing', spend: 130000, revenue: 540000, roas: 4.15, conversions: 75, cpa: 173 }
  ];

  const mockRoiData = [
    { campaign: 'Heritage Festival', spend: 85000, revenue: 420000, roi: 394, roas: 4.94 },
    { campaign: 'Wedding Season', spend: 120000, revenue: 580000, roi: 383, roas: 4.83 },
    { campaign: 'Craft Education', spend: 65000, revenue: 280000, roi: 331, roas: 4.31 },
    { campaign: 'Regional Pride', spend: 95000, revenue: 390000, roi: 311, roas: 4.11 },
    { campaign: 'Artisan Spotlight', spend: 75000, revenue: 290000, roi: 287, roas: 3.87 }
  ];

  const mockCampaignBreakdown = [
    { name: 'Social Media', value: 35, color: '#8884d8' },
    { name: 'Google Ads', value: 25, color: '#82ca9d' },
    { name: 'Email', value: 15, color: '#ffc658' },
    { name: 'Influencer', value: 12, color: '#ff8042' },
    { name: 'Content', value: 13, color: '#0088fe' }
  ];

  useEffect(() => {
    setMarketingData(mockMarketingData);
    setPerformanceMetrics(mockPerformanceMetrics);
    setRoiData(mockRoiData);
    setCampaignBreakdown(mockCampaignBreakdown);
  }, []);

  const channels = [
    { value: 'all', label: 'All Channels' },
    { value: 'social', label: 'Social Media' },
    { value: 'search', label: 'Search Ads' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'influencer', label: 'Influencer Marketing' },
    { value: 'content', label: 'Content Marketing' }
  ];

  const campaigns = [
    { value: 'all', label: 'All Campaigns' },
    { value: 'heritage', label: 'Heritage Festival' },
    { value: 'wedding', label: 'Wedding Season' },
    { value: 'education', label: 'Craft Education' },
    { value: 'regional', label: 'Regional Pride' },
    { value: 'spotlight', label: 'Artisan Spotlight' }
  ];

  const timeframes = [
    { value: '1m', label: 'Last 1 Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 1 Year' }
  ];

  const exportData = () => {
    toast({
      title: "Data Exported",
      description: "Marketing performance metrics have been exported successfully."
    });
  };

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
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Marketing Performance Metrics
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your marketing campaigns' performance and ROI
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Marketing Filters
            </div>
            <Button onClick={exportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>{timeframe.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Marketing Channel</label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>{channel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign</label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.value} value={campaign.value}>{campaign.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Marketing Spend</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1.8L</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8.5L</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+18.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROAS (Return on Ad Spend)</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8:1</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+0.3</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+0.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">Spend vs Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <AreaChart data={marketingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `₹${(Number(value) / 1000).toFixed(1)}k`, 
                      name === 'spend' ? 'Marketing Spend' : 'Revenue'
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="spend" name="Marketing Spend" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <BarChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'roas' ? `${value}:1` : 
                      name === 'cpa' ? `₹${value}` : 
                      name === 'conversions' ? `${value}` : 
                      `₹${value}`,
                      name === 'roas' ? 'ROAS' : 
                      name === 'cpa' ? 'Cost Per Acquisition' : 
                      name === 'conversions' ? 'Conversions' : 
                      'Amount'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="roas" name="ROAS" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="cpa" name="CPA (₹)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign ROI and Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">Campaign ROI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roiData.map((campaign, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div>
                    <div className="font-medium">{campaign.campaign}</div>
                    <div className="text-sm text-muted-foreground">Spend: ₹{campaign.spend.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{campaign.roas}:1</div>
                    <div className="text-sm text-muted-foreground">ROAS</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{campaign.roi}%</div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">Marketing Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
                <PieChart>
                  <Pie
                    data={campaignBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {campaignBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Marketing Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Top Performing Channels</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span>Email Marketing</span>
                  <Badge variant="secondary">ROAS: 4.72</Badge>
                </li>
                <li className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span>Influencer Marketing</span>
                  <Badge variant="secondary">ROAS: 4.45</Badge>
                </li>
                <li className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span>Social Media</span>
                  <Badge variant="secondary">ROAS: 4.27</Badge>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Key Performance Indicators</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall ROAS:</span>
                  <span className="font-medium">4.8:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Per Acquisition:</span>
                  <span className="font-medium">₹173</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Click-Through Rate:</span>
                  <span className="font-medium">6.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conversion Rate:</span>
                  <span className="font-medium">1.8%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold mb-2">Strategic Recommendations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Focus more budget on Email Marketing which has the highest ROAS</span>
              </li>
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Expand Influencer Marketing for high ROAS potential</span>
              </li>
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Optimize social media campaigns for better conversion rates</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketingPerformanceMetrics;