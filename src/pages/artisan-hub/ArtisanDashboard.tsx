import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-utils';
import { Package, Plus, ShoppingCart, Sparkles, Star, Box, ShoppingBag, Lightbulb, PlusCircle, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import axios from 'axios';

// Mock data for the dashboard - in a real implementation, this would come from Supabase
const mockMetrics = {
  totalSales: 245670,
  salesChange: '+12.5%',
  totalOrders: 142,
  ordersChange: '+8.2%',
  activeProducts: 24,
  productsChange: '+5',
  trustScore: '4.8/5',
  trustChange: '+0.3'
};

const mockProducts = [
  { id: '1', name: 'Kanchipuram Silk Saree', price: 12000, stock: 5, sales: 12 },
  { id: '2', name: 'Blue Pottery Vase', price: 2500, stock: 8, sales: 7 },
  { id: '3', name: 'Warli Painting', price: 8500, stock: 3, sales: 4 },
  { id: '4', name: 'Bidriware Pen Stand', price: 3200, stock: 12, sales: 9 },
];

const mockOrders = [
  { id: '1', customer: 'Ravi Kumar', product: 'Kanchipuram Silk Saree', amount: 12000, status: 'Shipped' },
  { id: '2', customer: 'Priya Sharma', product: 'Blue Pottery Vase', amount: 2500, status: 'Processing' },
  { id: '3', customer: 'Amit Patel', product: 'Warli Painting', amount: 8500, status: 'Delivered' },
];

const ArtisanDashboard = () => {
  const { translateSync } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(mockMetrics);
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [orders, setOrders] = useState<any[]>(mockOrders);

  const quickActions = [
    { title: translateSync('My Products'), icon: Box, color: 'bg-primary', route: '/artisans/products' },
    { title: translateSync('My Orders'), icon: ShoppingBag, color: 'bg-secondary', route: '/artisans/orders' },
    { title: translateSync('Marketing Hub'), icon: Lightbulb, color: 'bg-accent', route: '/artisans/marketing-hub' },
    { title: translateSync('Add New Product'), icon: PlusCircle, color: 'bg-farm-leaf', route: '/artisans/add-product' },
  ];

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const SalesChart = () => {
    // Mock data for the chart
    const chartData = [
      { month: 'Jan', sales: 45000 },
      { month: 'Feb', sales: 52000 },
      { month: 'Mar', sales: 48000 },
      { month: 'Apr', sales: 61000 },
      { month: 'May', sales: 55000 },
      { month: 'Jun', sales: 67000 },
    ];

    // Calculate max value for scaling the chart
    const maxValue = Math.max(...chartData.map(item => item.sales));
    const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);

    return (
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Overview
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">₹{totalSales.toLocaleString()}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col justify-end">
            <div className="flex items-end justify-between h-48 gap-2">
              {chartData.map((item, index) => (
                <motion.div
                  key={item.month}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative flex flex-col items-center flex-1 w-full">
                    {/* Vertical bar */}
                    <div 
                      className="w-8 bg-gradient-to-t from-primary to-primary/70 rounded-t-md hover:from-primary/90 hover:to-primary transition-all duration-300"
                      style={{ 
                        height: `${(item.sales / maxValue) * 80}%`,
                        minHeight: '20px' // Ensure visibility for small values
                      }}
                    />
                    {/* Month label */}
                    <p className="text-xs mt-2 text-muted-foreground">{item.month}</p>
                    {/* Value tooltip */}
                    <motion.div 
                      className="absolute -top-8 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap"
                      whileHover={{ opacity: 1 }}
                    >
                      ₹{item.sales.toLocaleString()}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Chart legend */}
            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Monthly Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Trend</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AIContentGenerator = () => {
    const [generating, setGenerating] = useState<string | null>(null); // null, 'description', 'social'
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [productInput, setProductInput] = useState<string>(''); // To track user input
    const [showInputModal, setShowInputModal] = useState<boolean>(false); // To show input modal
    const [contentType, setContentType] = useState<'description' | 'social' | null>(null); // Track which type of content to generate

    const handleGenerateClick = (type: 'description' | 'social') => {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to use AI content generation.",
          variant: "destructive",
        });
        return;
      }

      setContentType(type);
      setShowInputModal(true);
    };

    const generateContent = async () => {
      if (!contentType || !productInput.trim()) {
        toast({
          title: "Missing Input",
          description: "Please provide product details before generating content.",
          variant: "destructive",
        });
        return;
      }

      setShowInputModal(false);
      setGenerating(contentType);
      try {
        // Show a loading message while generating
        toast({
          title: "Generating Content",
          description: `Creating ${contentType === 'description' ? 'product description' : 'social media post'} for "${productInput}"...`,
        });

        // Simulate API call to AI service - in a real implementation, replace with actual API call
        // This is a mock implementation that shows a loading state for a few seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock response - in a real implementation, this would come from your AI service
        let content = '';
        if (contentType === 'description') {
          content = `Discover the exquisite craftsmanship of our ${productInput}, featuring intricate details and vibrant colors that capture the essence of South Indian heritage. Handwoven by skilled artisans using time-honored techniques passed down through generations, each ${productInput} is a unique masterpiece that tells a story of cultural excellence.`;
        } else {
          content = `🌟 Handcrafted with love by talented Indian artisans! This stunning ${productInput} is a perfect blend of tradition and elegance. Support our artisans and bring home a piece of cultural heritage. #ArtisanCraft #Handwoven #IndianHeritage #SupportArtisans #SustainableFashion #CulturalExcellence`;
        }

        setGeneratedContent(content);
        setGenerating(null);
        setProductInput(''); // Clear input after successful generation

        toast({
          title: "Content Generated Successfully",
          description: `${contentType === 'description' ? 'Product description' : 'Social media post'} has been created!`,
        });
      } catch (error) {
        console.error(`Error generating ${contentType} content:`, error);
        setGenerating(null);
        toast({
          title: "Error",
          description: `Failed to generate ${contentType} content. Please try again later.`,
          variant: "destructive",
        });
      }
    };

    return (
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">Generate marketing content for your products using AI</p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="border rounded-xl p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => handleGenerateClick('description')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Product Description</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create compelling product descriptions to attract customers
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="border rounded-xl p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => handleGenerateClick('social')}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Social Media Post</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Craft engaging posts for your social media marketing
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Modal for product input */}
            {showInputModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {contentType === 'description' ? <Package className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                      {contentType === 'description' ? 'Product Description' : 'Social Media Post'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter details about your product for personalized content generation:
                      </p>
                      <textarea
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        placeholder="e.g., Kanchipuram Silk Saree with golden zari work, vibrant colors, traditional design"
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          className="px-4 py-2 border border-input rounded-md hover:bg-accent/50 transition-colors"
                          onClick={() => setShowInputModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          onClick={generateContent}
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {generatedContent && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-input"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generated Content
                  </h4>
                  <button 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                  >
                    Copy <span className="hidden sm:inline">to clipboard</span>
                  </button>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap text-foreground">{generatedContent}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                  >
                    Copy
                  </button>
                  <button 
                    className="text-xs px-3 py-1.5 border border-input rounded-md hover:bg-accent/50 transition-colors"
                    onClick={() => setGeneratedContent('')}
                  >
                    Regenerate
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductTable = ({ products, onUpdateProduct, onDeleteProduct }: any) => (
    <Card className="hover:shadow-glow transition-all bg-card">
      <CardHeader>
        <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inventory
          </div>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
            onClick={() => navigate('/artisans/add-product')}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground">Product</th>
                <th className="text-right py-2 text-muted-foreground">Price</th>
                <th className="text-right py-2 text-muted-foreground">Stock</th>
                <th className="text-right py-2 text-muted-foreground">Sales</th>
                <th className="text-right py-2 text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 font-medium">{product.name}</td>
                  <td className="text-right">₹{product.price.toLocaleString()}</td>
                  <td className="text-right">{product.stock}</td>
                  <td className="text-right">{product.sales}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="text-primary hover:underline text-sm"
                        onClick={() => navigate(`/artisans/products/${product.id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-destructive hover:underline text-sm"
                        onClick={() => onDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const OrderManagement = () => (
    <Card className="hover:shadow-glow transition-all bg-card">
      <CardHeader>
        <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/10 transition-colors">
              <div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-muted-foreground">{order.product}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                <p className={`text-xs ${order.status === 'Delivered' ? 'text-green-600' : order.status === 'Processing' ? 'text-amber-600' : 'text-blue-600'}`}>
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const handleUpdateProduct = async (productId: string, updateData: any) => {
    try {
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, ...updateData } : product
        )
      );
      toast({
        title: "Product Updated",
        description: `Product ${productId} has been updated.`, 
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts(prev => prev.filter(product => product.id !== productId));
      toast({
        title: "Product Deleted",
        description: `Product ${productId} has been deleted.`, 
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <h1 className="text-hero text-primary font-indian mb-4">
          {translateSync("Project Artisans Dashboard")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {translateSync("Manage your artisan products and connect with your audience")}
        </p>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{translateSync("Total Sales")}</p>
                <h3 className="text-2xl font-bold text-foreground mb-2">₹{metrics.totalSales.toLocaleString()}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-success">{metrics.salesChange}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{translateSync("Total Orders")}</p>
                <h3 className="text-2xl font-bold text-foreground mb-2">{metrics.totalOrders}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-success">{metrics.ordersChange}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <ShoppingCart className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{translateSync("Active Products")}</p>
                <h3 className="text-2xl font-bold text-foreground mb-2">{metrics.activeProducts}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-success">{metrics.productsChange}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{translateSync("Trust Score")}</p>
                <h3 className="text-2xl font-bold text-foreground mb-2">{metrics.trustScore}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-success">{metrics.trustChange}</span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Shield className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {quickActions.map((action) => (
          <motion.div
            key={action.title}
            whileHover={{ 
              scale: 1.05,
              rotate: [0, -1, 1, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={() => handleQuickAction(action.route)}
          >
            <Card className="text-center p-4 hover:shadow-glow hover:bg-gradient-to-br hover:from-background hover:to-accent/5 transition-all duration-300 group">
              <motion.div 
                className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2 text-white text-xl group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {React.createElement(action.icon, { size: 24 })}
              </motion.div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {action.title}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Sales Chart and AI Content Generator */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesChart />
        <AIContentGenerator />
      </div>

      {/* Product Inventory */}
      <ProductTable 
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Order Management */}
      <OrderManagement />
    </motion.div>
  );
};

export default ArtisanDashboard;