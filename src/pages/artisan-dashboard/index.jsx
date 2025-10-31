import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import InfoCard from './components/InfoCard';
import ProductTable from './components/ProductTable';
import SalesChart from './components/SalesChart';
import OrderManagement from './components/OrderManagement';
import AIContentGenerator from './components/AIContentGenerator';
import QuickActions from './components/QuickActions';
import VoiceAssistant from '../../components/VoiceAssistant';
import ArtisanProfileEditor from '../../components/ArtisanProfileEditor';
import MarketplaceAnalytics from '../../components/MarketplaceAnalytics';
import ArtisanWorkflowBanner from '../../components/ArtisanWorkflowBanner';
import { artisanService } from '../../services/artisanService';

const ARTISAN_ID = 'test-artisan-1'; // Replace with real user/owner id from auth when ready

const ArtisanDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalSales: 45200,
      salesChange: '+12.5%',
      totalOrders: 156,
      ordersChange: '+8.3%',
      activeProducts: 24,
      productsChange: '+2',
      trustScore: 4.8,
      trustChange: '+0.2'
    },
    products: []
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  console.log('ArtisanDashboard - dashboardData:', dashboardData);

  useEffect(() => {
    setShowOnboarding(localStorage.getItem('artisan-onboarding-dismissed') !== 'true');
  }, []);
  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('artisan-onboarding-dismissed', 'true');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const products = await artisanService.getArtisanProducts();
        setDashboardData(d => ({ ...d, products }));
      } catch (e) {
        setProductsError('Failed to load products.');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleUpdateProduct = async (productId, updateData) => {
    setProductsLoading(true);
    try {
      await artisanService.updateArtisanProduct(productId, updateData);
      // Refetch after update
      const products = await artisanService.getArtisanProducts();
      setDashboardData(d => ({ ...d, products }));
    } catch (e) {
      setProductsError('Failed to update product.');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProductsLoading(true);
    try {
      await artisanService.deleteArtisanProduct(productId);
      const products = await artisanService.getArtisanProducts();
      setDashboardData(d => ({ ...d, products }));
    } catch (e) {
      setProductsError('Failed to delete product.');
    } finally {
      setProductsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {showOnboarding && (
          <div className="max-w-4xl mx-auto mb-6 mt-2 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-blue-50 border-l-4 border-yellow-400 shadow flex flex-col gap-2">
            <div className="text-lg font-bold text-primary">Welcome to your Artisan Dashboard!</div>
            <div className="text-gray-800">Follow the steps in the Workflow above to complete your profile, list products, generate AI-powered promotions, and monitor your growth—all with help from our marketplace assistant.</div>
            <div className="flex gap-2 mt-2"><button className="px-4 py-1 rounded border bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300" onClick={dismissOnboarding}>Got it</button></div>
          </div>
        )}
        {/* Workflow Banner */}
        <ArtisanWorkflowBanner />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Artisan Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your crafts, track sales, and grow your business
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date()?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <InfoCard
              title="Total Sales"
              description={`₹${dashboardData?.metrics?.totalSales?.toLocaleString()}`}
              icon="TrendingUp"
              color="primary"
            />
            <InfoCard
              title="Total Orders"
              description={dashboardData?.metrics?.totalOrders}
              icon="ShoppingBag"
              color="success"
            />
            <InfoCard
              title="Active Products"
              description={dashboardData?.metrics?.activeProducts}
              icon="Package"
              color="accent"
            />
            <InfoCard
              title="Trust Score"
              description={dashboardData?.metrics?.trustScore}
              icon="Shield"
              color="warning"
            />
          </div>

          {/* Artisan Story/Profile Editor */}
          <ArtisanProfileEditor />

          {/* AI Analytics & Recommendation Widget */}
          <MarketplaceAnalytics className="mb-8" showFullDashboard={false} userRole="seller" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Sales Chart - Takes 2 columns */}
            <div className="xl:col-span-2">
              <SalesChart />
            </div>
            
            {/* Quick Actions - Takes 1 column */}
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Product Management */}
          <div className="mb-8">
            {productsError && <div className="text-red-600 mb-2">{productsError}</div>}
            {productsLoading && <div className="text-blue-700 mb-2">Loading products...</div>}
            <ProductTable
              products={dashboardData?.products}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>

          {/* Bottom Section Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Order Management */}
            <div>
              <OrderManagement />
            </div>
            
            {/* AI Content Generator */}
            <div>
              <AIContentGenerator />
            </div>
          </div>
        </div>
      </main>
      <VoiceAssistant />
    </div>
  );
};

export default ArtisanDashboard;