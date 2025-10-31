import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package,
  Search,
  Star,
  User,
  MapPin,
  Clock,
  Eye,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { artisanService } from '@/services/artisanService';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';

interface Artifact {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  artisan_id: string;
  location: string;
  rating: number;
  images: string[];
  description: string;
  condition: string;
  postedAt: Date;
  likes: number;
  aiDescription?: string;
  aiStory?: string;
  discountPercentage?: number;
  isTopSeller?: boolean;
  isNewArrival?: boolean;
  reviews?: number;
}

const Marketplace = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = (product: Artifact) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  useEffect(() => {
    const fetchArtifacts = async () => {
      setIsLoadingArtifacts(true);
      try {
        const fetchedArtifacts = await artisanService.getArtisanProducts();
        // Add placeholder attributes for now
        const artifactsWithAttributes = fetchedArtifacts.map(artifact => ({
          ...artifact,
          discountPercentage: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0, // 40% chance of discount
          isTopSeller: Math.random() > 0.7, // 30% chance
          isNewArrival: Math.random() > 0.8, // 20% chance
          reviews: Math.floor(Math.random() * 50) + 10,
        }));
        setArtifacts(artifactsWithAttributes);
      } catch (error) {
        console.error("Failed to fetch artifacts:", error);
        toast({
          title: translateSync("Error"),
          description: translateSync("Failed to load artifacts."),
          variant: "destructive",
        });
      } finally {
        setIsLoadingArtifacts(false);
      }
    };
    fetchArtifacts();
  }, [toast, translateSync]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📦' },
    { id: 'tools', name: 'Farm Tools', icon: '🔨' },
    { id: 'pottery', name: 'Pottery', icon: '🏺' },
    { id: 'storage', name: 'Storage', icon: '🫙' },
    { id: 'decorative', name: 'Decorative', icon: '🎨' }
  ];

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artifact.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || artifact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    // Optionally scroll to product grid
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-success text-success-foreground';
      case 'good':
        return 'bg-blue-500 text-blue-50';
      case 'fair':
        return 'bg-yellow-500 text-yellow-50';
      case 'poor':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-hero text-primary font-indian mb-2">
            🏺 {translateSync('Artifacts Marketplace')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync('Discover and collect unique traditional artifacts')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={translateSync("Search artifacts...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Discover Categories */}
          <div className="py-4">
            <h3 className="text-xl font-bold mb-4">{translateSync('Discover Categories')}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center space-x-2 ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent-foreground'}`}
                >
                  <span>{category.icon}</span>
                  <span>{translateSync(category.name)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Top Sellers */}
          {artifacts.filter(p => p.isTopSeller).length > 0 && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-primary">🏆</span> {translateSync('Top Sellers')}
              </h3>
              <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                {artifacts.filter(p => p.isTopSeller).slice(0, 8).map((artifact, index) => (
                  <ProductCard
                    key={artifact.id}
                    product={{
                      id: artifact.id,
                      name: artifact.name,
                      category: artifact.category,
                      price: artifact.price,
                      image: artifact.images[0] || '',
                      rating: artifact.rating,
                      reviews: artifact.reviews,
                      discountPercentage: artifact.discountPercentage,
                      isTopSeller: artifact.isTopSeller,
                      isNewArrival: artifact.isNewArrival,
                    }}
                    isInWishlist={isInWishlist(artifact.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Special Discounts */}
          {artifacts.filter(p => p.discountPercentage && p.discountPercentage > 0).length > 0 && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-destructive">💰</span> {translateSync('Special Discounts')}
              </h3>
              <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                {artifacts.filter(p => p.discountPercentage && p.discountPercentage > 0).slice(0, 8).map((artifact, index) => (
                  <ProductCard
                    key={artifact.id}
                    product={{
                      id: artifact.id,
                      name: artifact.name,
                      category: artifact.category,
                      price: artifact.price,
                      image: artifact.images[0] || '',
                      rating: artifact.rating,
                      reviews: artifact.reviews,
                      discountPercentage: artifact.discountPercentage,
                      isTopSeller: artifact.isTopSeller,
                      isNewArrival: artifact.isNewArrival,
                    }}
                    isInWishlist={isInWishlist(artifact.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* New Arrivals */}
          {artifacts.filter(p => p.isNewArrival).length > 0 && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-success">✨</span> {translateSync('New Arrivals')}
              </h3>
              <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                {artifacts.filter(p => p.isNewArrival).slice(0, 8).map((artifact, index) => (
                  <ProductCard
                    key={artifact.id}
                    product={{
                      id: artifact.id,
                      name: artifact.name,
                      category: artifact.category,
                      price: artifact.price,
                      image: artifact.images[0] || '',
                      rating: artifact.rating,
                      reviews: artifact.reviews,
                      discountPercentage: artifact.discountPercentage,
                      isTopSeller: artifact.isTopSeller,
                      isNewArrival: artifact.isNewArrival,
                    }}
                    isInWishlist={isInWishlist(artifact.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredArtifacts.map((artifact, index) => (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <ProductCard
                    product={{
                      id: artifact.id,
                      name: artifact.name,
                      category: artifact.category,
                      price: artifact.price,
                      image: artifact.images[0] || '',
                      rating: artifact.rating,
                      reviews: artifact.reviews,
                      discountPercentage: artifact.discountPercentage,
                      isTopSeller: artifact.isTopSeller,
                      isNewArrival: artifact.isNewArrival,
                    }}
                    isInWishlist={isInWishlist(artifact.id)}
                    onWishlistToggle={handleWishlistToggle}
                    onCategoryClick={handleCategoryClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {filteredArtifacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{translateSync('No artifacts found')}</h3>
            <p className="text-muted-foreground mb-4">
              {translateSync('Try adjusting your search or browse different categories')}
            </p>
          </motion.div>
        )}
      </div>
  );
};

export default Marketplace;