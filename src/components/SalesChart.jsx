import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/ArtomartAuthContext';

const SalesChart = () => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!userProfile?.id) return;

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('artisan_id', userProfile.id);
        formData.append('time_range', timeRange);

        const response = await axios.post('https://chintuvignu17-projectkisan.hf.space/api/artisan/sales-analytics', formData);
        if (response.data.success) {
          setSalesData(response.data.sales_data);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        // Handle error, e.g., show a toast notification
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange, userProfile]);

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '6m', label: '6 Months' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm-sm">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Sales Analytics
          </h3>
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              {timeRangeOptions?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => setTimeRange(option?.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                    timeRange === option?.value
                      ? 'bg-background text-foreground shadow-warm-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option?.label}
                </button>
              ))}
            </div>
            
            {/* Chart Type Toggle */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  chartType === 'line' ?'bg-background text-foreground shadow-warm-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp size={16} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  chartType === 'bar' ?'bg-background text-foreground shadow-warm-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
              {chartType === 'line' ? (
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                    formatter={(value, name) => [
                      name === 'sales' ? `₹${value}` : value,
                      name === 'sales' ? 'Sales' : 'Orders'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="var(--color-accent)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                    formatter={(value, name) => [
                      name === 'sales' ? `₹${value}` : value,
                      name === 'sales' ? 'Sales' : 'Orders'
                    ]}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="var(--color-primary)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Sales Revenue</span>
          </div>
          {chartType === 'line' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm text-muted-foreground">Order Count</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;