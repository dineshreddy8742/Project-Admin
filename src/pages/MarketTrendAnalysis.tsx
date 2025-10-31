import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, Calendar, Filter, Download, IndianRupee, Eye, ShoppingCart, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const MarketTrendAnalysis = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState('india');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
  const [selectedCraftType, setSelectedCraftType] = useState('all');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [demandData, setDemandData] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);

  // Indian regions for market analysis
  const regions = [
    { value: 'india', label: 'All India' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'odisha', label: 'Odisha' }
  ];

  // Craft types
  const craftTypes = [
    { value: 'all', label: 'All Crafts' },
    { value: 'pottery', label: 'Pottery & Ceramics' },
    { value: 'textiles', label: 'Textiles & Weaving' },
    { value: 'metalwork', label: 'Metalwork' },
    { value: 'woodwork', label: 'Woodwork' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'sculpture', label: 'Sculpture' },
    { value: 'paintings', label: 'Traditional Paintings' }
  ];

  // Timeframes
  const timeframes = [
    { value: '1m', label: 'Last 1 Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 1 Year' }
  ];

  // Generate mock market trend data based on selections
  useEffect(() => {
    // Mock data for trend analysis
    const mockTrendData = [
      { month: 'Jan', pottery: 4000, textiles: 2400, metalwork: 2400, sales: 8800 },
      { month: 'Feb', pottery: 3000, textiles: 1398, metalwork: 2210, sales: 6608 },
      { month: 'Mar', pottery: 2000, textiles: 9800, metalwork: 2290, sales: 14290 },
      { month: 'Apr', pottery: 2780, textiles: 3908, metalwork: 2000, sales: 8688 },
      { month: 'May', pottery: 1890, textiles: 4800, metalwork: 2181, sales: 8871 },
      { month: 'Jun', pottery: 2390, textiles: 3800, metalwork: 2500, sales: 8690 }
    ];

    const mockDemandData = [
      { craft: 'Pottery', demand: 85, supply: 60, trend: 'up' },
      { craft: 'Textiles', demand: 92, supply: 75, trend: 'up' },
      { craft: 'Metalwork', demand: 70, supply: 68, trend: 'stable' },
      { craft: 'Woodwork', demand: 65, supply: 55, trend: 'up' },
      { craft: 'Jewelry', demand: 78, supply: 62, trend: 'up' },
      { craft: 'Sculpture', demand: 55, supply: 40, trend: 'up' }
    ];

    const mockPopularProducts = [
      { id: 1, name: 'Kanchipuram Silk Saree', region: 'Tamil Nadu', price: 15000, sales: 120, rating: 4.8 },
      { id: 2, name: 'Blue Pottery Handi', region: 'Rajasthan', price: 2500, sales: 98, rating: 4.7 },
      { id: 3, name: 'Warli Painting', region: 'Maharashtra', price: 8000, sales: 85, rating: 4.6 },
      { id: 4, name: 'Madhubani Painting', region: 'Bihar', price: 6500, sales: 72, rating: 4.9 },
      { id: 5, name: 'Bidriware', region: 'Karnataka', price: 12000, sales: 68, rating: 4.5 }
    ];

    setTrendData(mockTrendData);
    setDemandData(mockDemandData);
    setPopularProducts(mockPopularProducts);
  }, [selectedRegion, selectedTimeframe, selectedCraftType]);

  const exportData = () => {
    toast({
      title: "Data Exported",
      description: "Market trend analysis data has been exported successfully."
    });
  };

  const getRegionLabel = (regionCode: string) => {
    const region = regions.find(r => r.value === regionCode);
    return region ? region.label : 'All India';
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
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Market Trend Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Understand market demand and trends for Indian traditional crafts
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Market Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Craft Type</label>
              <Select value={selectedCraftType} onValueChange={setSelectedCraftType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select craft type" />
                </SelectTrigger>
                <SelectContent>
                  {craftTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={exportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends Chart */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
            <span>Sales Trend Analysis</span>
            <div className="text-sm text-muted-foreground">
              {getRegionLabel(selectedRegion)} • {timeframes.find(t => t.value === selectedTimeframe)?.label}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pottery" fill="#8884d8" name="Pottery & Ceramics" />
                <Bar dataKey="textiles" fill="#82ca9d" name="Textiles & Weaving" />
                <Bar dataKey="metalwork" fill="#ffc658" name="Metalwork" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Demand vs Supply Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Demand vs Supply Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="craft" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="demand" stroke="#8884d8" name="Demand" strokeWidth={2} />
                  <Line type="monotone" dataKey="supply" stroke="#82ca9d" name="Supply" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demandData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      item.trend === 'up' ? 'bg-green-100 text-green-800' : 
                      item.trend === 'down' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                       item.trend === 'down' ? <TrendingUp className="h-4 w-4 rotate-180" /> : 
                       <div className="h-4 w-4 rounded-full bg-current"></div>}
                    </div>
                    <div>
                      <div className="font-medium">{item.craft}</div>
                      <div className="text-sm text-muted-foreground">Demand: {item.demand}% Supply: {item.supply}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      item.demand > item.supply ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {item.demand > item.supply ? 'High Demand' : 'Balanced'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Products */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Popular Craft Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Region</th>
                  <th className="text-right py-2">Price (₹)</th>
                  <th className="text-right py-2">Sales (units)</th>
                  <th className="text-right py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-secondary/50">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3">{product.region}</td>
                    <td className="py-3 text-right">₹{product.price.toLocaleString()}</td>
                    <td className="py-3 text-right">{product.sales}</td>
                    <td className="py-3 text-right flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                      {product.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Market Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">High Demand Items</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pottery & Ceramics: 85% demand vs 60% supply</li>
                <li>• Textiles & Weaving: 92% demand vs 75% supply</li>
                <li>• Sculpture: 55% demand vs 40% supply</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Seasonal Opportunities</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Festival seasons see 40% increase in demand</li>
                <li>• Wedding seasons boost textile sales</li>
                <li>• Tourist season increases regional craft interest</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold mb-2">Strategic Advice</h3>
            <p className="text-sm text-muted-foreground">
              Focus on high-demand crafts with supply shortages. Consider regional festivals and cultural events to optimize your marketing strategy. 
              Textiles and pottery show the highest growth potential in the current market.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MarketTrendAnalysis;