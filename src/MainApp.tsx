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
import { useAgent } from '@/hooks/useAgent';
import { AgentInterface } from '@/components/AgentInterface';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

const MainApp = () => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  const agent = useAgent();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // For admin users - they should be able to access both layouts
  if (userProfile?.role === 'admin') {
    // Check if we're currently on an admin path
    const isAdminPath = location.pathname.startsWith('/admin');
    
    if (isAdminPath) {
      // When on admin path, use the farmer layout
      return (
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Also make other routes available to admin */}
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
              
              {/* Artisan routes also available to admin */}
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
              <Route path="/artisans/profile" element={<ArtisanProfile />} />
              <Route path="/artisans/:artisanId" element={<ArtisanProfile />} />
              <Route path="/artisans/search" element={<SearchDiscoveryFeatures />} />
              <Route path="/artisans/reviews" element={<CustomerReviewSystem />} />
              <Route path="/artisans/analytics" element={<SalesAnalyticsDashboard />} />
              <Route path="/artisans/behavior" element={<CustomerBehaviorInsights />} />
              <Route path="/marketplace" element={<PublicBrowsingInterface />} />
              <Route path="/product/:productId" element={<ProductDetailsPage />} />
              
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </Layout>
          <AgentInterface
            conversation={agent.conversation}
            isSpeaking={agent.isSpeaking}
            isListening={agent.isListening}
            listeningText={agent.listeningText}
            onClose={agent.handleClose}
            onSendMessage={agent.handleSendMessage}
            isVisible={agent.isVisible}
            isThinking={agent.isThinking}
            onVoiceToggle={agent.handleVoiceToggle}
            onCancelSpeaking={agent.handleCancelSpeaking}
            status={agent.status}
          />
          <Button
            onClick={agent.handleOpen}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Bot size={32} />
          </Button>
        </CartProvider>
      );
    } else {
      // For non-admin paths, use artisan layout for admin
      return (
        <CartProvider>
          <WishlistProvider>
            <ProjectArtisansLayout>
              <Routes>
                {/* Artisan routes */}
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
                <Route path="/product/:productId" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Farmer routes */}
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
                <Route path="/artisan/:artisanId" element={<ArtisanStorefront />} />
                
                {/* Admin dashboard route */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                <Route path="*" element={<Navigate to="/artisans/dashboard" />} />
              </Routes>
            </ProjectArtisansLayout>
            <AgentInterface
              conversation={agent.conversation}
              isSpeaking={agent.isSpeaking}
              isListening={agent.isListening}
              listeningText={agent.listeningText}
              onClose={agent.handleClose}
              onSendMessage={agent.handleSendMessage}
              isVisible={agent.isVisible}
              isThinking={agent.isThinking}
              onVoiceToggle={agent.handleVoiceToggle}
              onCancelSpeaking={agent.handleCancelSpeaking}
              status={agent.status}
            />
            <Button
              onClick={agent.handleOpen}
              className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Bot size={32} />
            </Button>
          </WishlistProvider>
        </CartProvider>
      );
    }
  }

  // For artisan sellers
  if (userProfile?.role === 'artifact_seller') {
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
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<Navigate to="/artisans/dashboard" />} />
            </Routes>
          </ProjectArtisansLayout>
          <AgentInterface
            conversation={agent.conversation}
            isSpeaking={agent.isSpeaking}
            isListening={agent.isListening}
            listeningText={agent.listeningText}
            onClose={agent.handleClose}
            onSendMessage={agent.handleSendMessage}
            isVisible={agent.isVisible}
            isThinking={agent.isThinking}
            onVoiceToggle={agent.handleVoiceToggle}
            onCancelSpeaking={agent.handleCancelSpeaking}
            status={agent.status}
          />
          <Button
            onClick={agent.handleOpen}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Bot size={32} />
          </Button>
        </WishlistProvider>
      </CartProvider>
    );
  }

  // For farmers
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
      <AgentInterface
        conversation={agent.conversation}
        isSpeaking={agent.isSpeaking}
        isListening={agent.isListening}
        listeningText={agent.listeningText}
        onClose={agent.handleClose}
        onSendMessage={agent.handleSendMessage}
        isVisible={agent.isVisible}
        isThinking={agent.isThinking}
        onVoiceToggle={agent.handleVoiceToggle}
        onCancelSpeaking={agent.handleCancelSpeaking}
        status={agent.status}
      />
      <Button
        onClick={agent.handleOpen}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <Bot size={32} />
      </Button>
    </CartProvider>
  );
};

export default MainApp;
