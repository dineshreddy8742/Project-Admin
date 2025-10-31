import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Users, Package, Loader2 } from 'lucide-react';
import { apiService } from '@/services/apiService';

const SalesAnalyticsDashboard = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Mock category data - will be replaced with real data from API
  const mockCategoryData = [
    { name: 'Textiles', value: 45 },
    { name: 'Pottery', value: 25 },
    { name: 'Jewelry', value: 15 },
    { name: 'Woodwork', value: 10 },
    { name: 'Paintings', value: 5 },
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would get the artisan ID from context or props
        // For now we're using a placeholder ID
        const artisanId = 'artisan-placeholder-id';
        
        const response = await apiService.getSalesAnalytics(artisanId, timeRange);
        
        if (response.success) {
          const data = response.sales_data || [];
          setSalesData(data);
          
          // Calculate summary from API data
          const totalSales = data.reduce((sum: number, day: any) => sum + day.sales, 0);
          const totalOrders = data.reduce((sum: number, day: any) => sum + day.orders, 0);
          const totalCustomers = data.reduce((sum: number, day: any) => sum + day.customers || 0, 0);
          
          const avgOrderValue = totalSales / (totalOrders || 1);
          
          setSummary({
            totalSales,
            totalOrders,
            totalCustomers,
            avgOrderValue,
            growth: 12.5 // This would come from API in a real implementation
          });
        } else {
          // Fallback to mock data if API fails
          console.warn('API response failed, using mock data');
          
          // Mock sales data
          const mockSalesData = [
            { date: '2024-01-01', sales: 45000, orders: 24, customers: 18 },
            { date: '2024-01-02', sales: 52000, orders: 28, customers: 22 },
            { date: '2024-01-03', sales: 38000, orders: 20, customers: 15 },
            { date: '2024-01-04', sales: 67000, orders: 35, customers: 28 },
            { date: '2024-01-05', sales: 55000, orders: 30, customers: 24 },
            { date: '2024-01-06', sales: 78000, orders: 42, customers: 35 },
            { date: '2024-01-07', sales: 62000, orders: 32, customers: 27 },
            { date: '2024-01-08', sales: 81000, orders: 45, customers: 38 },
            { date: '2024-01-09', sales: 75000, orders: 40, customers: 33 },
            { date: '2024-01-10', sales: 89000, orders: 48, customers: 42 },
            { date: '2024-01-11', sales: 72000, orders: 38, customers: 31 },
            { date: '2024-01-12', sales: 95000, orders: 52, customers: 45 },
            { date: '2024-01-13', sales: 68000, orders: 36, customers: 29 },
            { date: '2024-01-14', sales: 102000, orders: 56, customers: 48 },
          ];
          
          setSalesData(mockSalesData);
          
          // Calculate summary from mock data
          const totalSales = mockSalesData.reduce((sum, day) => sum + day.sales, 0);
          const totalOrders = mockSalesData.reduce((sum, day) => sum + day.orders, 0);
          const totalCustomers = mockSalesData.reduce((sum, day) => sum + day.customers, 0);
          
          const avgOrderValue = totalSales / totalOrders;
          
          setSummary({
            totalSales,
            totalOrders,
            totalCustomers,
            avgOrderValue,
            growth: 12.5 // Mock growth percentage
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sales analytics data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    // In a real implementation, this would also come from the API
    setCategoryData(mockCategoryData);
  }, [timeRange]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading analytics data...</p>
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
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Sales Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your artisan business performance and sales trends
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing analytics for the last {timeRange.replace('d', ' days')}
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
              Total Sales
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5 inline mr-1" />
              {summary.totalSales?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+{summary.growth}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Total Orders
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {summary.totalOrders?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              New Customers
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {summary.totalCustomers?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-card-title text-primary font-indian text-sm">
              Avg. Order Value
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5 inline mr-1" />
              {Math.round(summary.avgOrderValue)?.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    fill="url(#colorSales)" 
                    strokeWidth={2}
                    name="Sales (₹)"
                  />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Artisans */}
        <Card className="hover:shadow-glow transition-all bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian">
              Top Selling Artisans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-muted-foreground">Artisan</th>
                    <th className="text-right py-3 text-muted-foreground">Sales (₹)</th>
                    <th className="text-right py-3 text-muted-foreground">Orders</th>
                    <th className="text-right py-3 text-muted-foreground">Items</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">
                      <div className="font-medium">Smt. Meenakshi Devi</div>
                      <div className="text-sm text-muted-foreground">Kanchipuram, Tamil Nadu</div>
                    </td>
                    <td className="text-right font-medium">₹1,45,000</td>
                    <td className="text-right">42</td>
                    <td className="text-right">24</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">
                      <div className="font-medium">Sh. Rajesh Kumar</div>
                      <div className="text-sm text-muted-foreground">Jaipur, Rajasthan</div>
                    </td>
                    <td className="text-right font-medium">₹98,000</td>
                    <td className="text-right">36</td>
                    <td className="text-right">18</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">
                      <div className="font-medium">Sh. Sanjay Pawar</div>
                      <div className="text-sm text-muted-foreground">Mumbai, Maharashtra</div>
                    </td>
                    <td className="text-right font-medium">₹76,000</td>
                    <td className="text-right">31</td>
                    <td className="text-right">22</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">
                      <div className="font-medium">Smt. Fatima Khan</div>
                      <div className="text-sm text-muted-foreground">Bidar, Karnataka</div>
                    </td>
                    <td className="text-right font-medium">₹62,000</td>
                    <td className="text-right">28</td>
                    <td className="text-right">15</td>
                  </tr>
                  <tr>
                    <td className="py-3">
                      <div className="font-medium">Smt. Shanti Devi</div>
                      <div className="text-sm text-muted-foreground">Muzaffarpur, Bihar</div>
                    </td>
                    <td className="text-right font-medium">₹54,000</td>
                    <td className="text-right">24</td>
                    <td className="text-right">12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Best Day</h3>
              </div>
              <p className="text-2xl font-bold text-primary">₹1,02,000</p>
              <p className="text-sm text-muted-foreground">Jan 14, 2024</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Lowest Sales</h3>
              </div>
              <p className="text-2xl font-bold text-primary">₹38,000</p>
              <p className="text-sm text-muted-foreground">Jan 3, 2024</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Avg. Orders</h3>
              </div>
              <p className="text-2xl font-bold text-primary">{Math.round(summary.totalOrders / 14)}</p>
              <p className="text-sm text-muted-foreground">Per day (last 14 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesAnalyticsDashboard;