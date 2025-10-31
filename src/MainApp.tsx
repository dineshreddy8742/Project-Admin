import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import { Layout } from '@/components/Layout';
import { ProjectArtisansLayout } from '@/components/ProjectArtisansLayout';
import Dashboard from '@/pages/Dashboard';
import CropMonitor from '@/pages/CropMonitor';
import CropRecommendation from '@/pages/CropRecommendation';
import DiseaseDetector from '@/pages/DiseaseDetector';
import MarketTrends from '@/pages/MarketTrends';
import GovernmentSchemes from '@/pages/GovernmentSchemes';
import Settings from '@/pages/Settings';
import GroceryMarketplace from '@/pages/GroceryMarketplace';
import Orders from '@/pages/Orders';
import Marketplace from '@/pages/Marketplace';
import Profile from '@/pages/Profile';
import ColdStorage from '@/pages/ColdStorage';
import Community from '@/pages/Community';
import Help from '@/pages/Help';
import Cart from '@/pages/Cart';
import ArtisanDashboard from '@/pages/artisan-hub/ArtisanDashboard';
import ArtisanProducts from '@/pages/artisan-hub/ArtisanProducts';
import ArtisanOrders from '@/pages/artisan-hub/ArtisanOrders';
import MarketingHub from '@/pages/artisan-hub/MarketingHub';
import AddProduct from '@/pages/artisan-hub/AddProduct';
import AdminDashboard from '@/pages/artisan-hub/AdminDashboard';
import ArtisanStorefront from '@/pages/ArtisanStorefront';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import HeritageStoryGenerator from '@/pages/HeritageStoryGenerator';
import RegionalLanguageSupport from '@/pages/RegionalLanguageSupport';
import CraftEducationModules from '@/pages/CraftEducationModules';
import MarketTrendAnalysis from '@/pages/MarketTrendAnalysis';
import PublicBrowsingInterface from '@/pages/PublicBrowsingInterface';
import ArtisanProfile from '@/pages/ArtisanProfile';
import SearchDiscoveryFeatures from '@/pages/SearchDiscoveryFeatures';
import CustomerReviewSystem from '@/pages/CustomerReviewSystem';
import SalesAnalyticsDashboard from '@/pages/SalesAnalyticsDashboard';
import CustomerBehaviorInsights from '@/pages/CustomerBehaviorInsights';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartProvider } from '@/contexts/CartContext';

const MainApp = () => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (userProfile?.role === 'artifact_seller' || userProfile?.role === 'admin') {
    return (
      <CartProvider>
        <WishlistProvider>
          <ProjectArtisansLayout>
            <Routes>

            <Route path="/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/artisans/dashboard" element={<ArtisanDashboard />} />
            <Route path="/artisans/products" element={<ArtisanProducts />} />
            <Route path="/artisans/add-product" element={<AddProduct />} />
            <Route path="/artisans/orders" element={<ArtisanOrders />} />
            <Route path="/artisans/marketing-hub" element={<MarketingHub />} />
            <Route path="/artisans/heritage-story" element={<HeritageStoryGenerator />} />
            <Route path="/artisans/regional-language" element={<RegionalLanguageSupport />} />
            <Route path="/artisans/craft-education" element={<CraftEducationModules />} />
            <Route path="/artisans/market-trends" element={<MarketTrendAnalysis />} />
            <Route path="/artisans/public-browse" element={<PublicBrowsingInterface />} />
            <Route path="/marketplace" element={<PublicBrowsingInterface />} />
            <Route path="/artisans/profile" element={<ArtisanProfile />} />
            <Route path="/artisans/:artisanId" element={<ArtisanProfile />} />
            <Route path="/artisans/search" element={<SearchDiscoveryFeatures />} />
            <Route path="/artisans/reviews" element={<CustomerReviewSystem />} />
            <Route path="/artisans/analytics" element={<SalesAnalyticsDashboard />} />
            <Route path="/artisans/behavior" element={<CustomerBehaviorInsights />} />
            <Route path="/cart" element={<Cart />} />


            {userProfile?.role === 'admin' && (
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            )}
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/artisans/dashboard" />} />
          </Routes>
        </ProjectArtisansLayout>
      </WishlistProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <Layout>
        <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-monitor" element={<CropMonitor />} />
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/disease-detector" element={<DiseaseDetector />} />
        <Route path="/market-trends" element={<MarketTrends />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />
        <Route path="/grocery-marketplace" element={<GroceryMarketplace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cold-storage" element={<ColdStorage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/help" element={<Help />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/artisan/:artisanId" element={<ArtisanStorefront />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
    </CartProvider>
  );
};

export default MainApp;
