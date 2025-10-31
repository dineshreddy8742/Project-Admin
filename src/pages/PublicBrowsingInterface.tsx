import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Heart, ShoppingCart, Star, IndianRupee, MapPin, Package } from 'lucide-react';

const PublicBrowsingInterface = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Mock artisan products data
  const mockArtisanProducts = [
    {
      id: 1,
      name: 'Kanchipuram Silk Saree',
      artisan: 'Smt. Meenakshi',
      region: 'Tamil Nadu',
      description: 'Authentic Kanchipuram silk saree with traditional zari work, handwoven by master artisans.',
      price: 12000,
      originalPrice: 15000,
      rating: 4.8,
      reviews: 124,
      category: 'textiles',
      images: ['saree1.jpg'],
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: 'Blue Pottery Handi',
      artisan: 'Sh. Rajesh Kumar',
      region: 'Rajasthan',
      description: 'Handcrafted blue pottery handi with traditional Rajasthani designs, made using eco-friendly techniques.',
      price: 2500,
      originalPrice: 3000,
      rating: 4.6,
      reviews: 89,
      category: 'pottery',
      images: ['pottery1.jpg'],
      inStock: true,
      featured: true
    },
    {
      id: 3,
      name: 'Warli Tribal Painting',
      artisan: 'Sh. Sanjay Pawar',
      region: 'Maharashtra',
      description: 'Traditional Warli tribal painting on canvas, depicting village life and nature scenes.',
      price: 8500,
      originalPrice: 9500,
      rating: 4.9,
      reviews: 67,
      category: 'paintings',
      images: ['painting1.jpg'],
      inStock: true,
      featured: false
    },
    {
      id: 4,
      name: 'Bidriware Pen Stand',
      artisan: 'Smt. Fatima Khan',
      region: 'Karnataka',
      description: 'Intricate Bidriware pen stand with traditional silver inlay work, representing Karnataka\'s metal craft heritage.',
      price: 3200,
      originalPrice: 3800,
      rating: 4.7,
      reviews: 52,
      category: 'metalwork',
      images: ['bidri1.jpg'],
      inStock: false,
      featured: true
    },
    {
      id: 5,
      name: 'Madhubani Painting',
      artisan: 'Smt. Shanti Devi',
      region: 'Bihar',
      description: 'Vibrant Madhubani painting on paper, featuring traditional motifs and colors using natural pigments.',
      price: 7200,
      originalPrice: 7800,
      rating: 4.8,
      reviews: 93,
      category: 'paintings',
      images: ['madhubani1.jpg'],
      inStock: true,
      featured: false
    },
    {
      id: 6,
      name: 'Channapatna Wooden Toys',
      artisan: 'Sh. Ravi Gowda',
      region: 'Karnataka',
      description: 'Colorful Channapatna wooden toys, painted with vegetable dyes, safe for children.',
      price: 1500,
      originalPrice: 1800,
      rating: 4.5,
      reviews: 108,
      category: 'woodwork',
      images: ['wooden1.jpg'],
      inStock: true,
      featured: true
    }
  ];

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'textiles', label: 'Textiles & Weaving' },
    { value: 'pottery', label: 'Pottery & Ceramics' },
    { value: 'paintings', label: 'Traditional Paintings' },
    { value: 'metalwork', label: 'Metalwork' },
    { value: 'woodwork', label: 'Woodwork' },
    { value: 'jewelry', label: 'Jewelry' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' }
  ];

  useEffect(() => {
    setProducts(mockArtisanProducts);
    setFilteredProducts(mockArtisanProducts);
  }, []);

  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.artisan.toLowerCase().includes(query) ||
        product.region.toLowerCase().includes(query)
      );
    }
    
    // Sort results
    switch (sortOption) {
      case 'popularity':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, sortOption, products]);

  const addToWishlist = (productId: number) => {
    toast({
      title: "Added to Wishlist",
      description: "This item has been added to your wishlist."
    });
  };

  const addToCart = (productId: number) => {
    toast({
      title: "Added to Cart",
      description: "This item has been added to your cart."
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-hero text-primary font-indian mb-4">
            Discover Indian Artisan Treasures
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Handcrafted with love and tradition. Support local artisans and preserve India's cultural heritage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for artisan products, crafts, or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Categories</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} artisan products
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="hover:shadow-glow transition-all bg-card overflow-hidden">
              <div className="relative">
                <img 
                  src={product.images[0] || '/placeholder-image.jpg'} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
                )}
                {product.originalPrice > product.price && (
                  <Badge className="absolute top-2 right-2 bg-destructive">Sale</Badge>
                )}
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute top-12 right-2"
                  onClick={() => addToWishlist(product.id)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-card-title text-primary font-indian text-base">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-amber-500" />
                    <span className="text-sm">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{product.region}</span>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  By {product.artisan}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      <IndianRupee className="h-4 w-4 inline mr-0.5" />
                      {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        <IndianRupee className="h-3 w-3 inline mr-0.5" />
                        {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {product.inStock ? (
                    <Badge variant="secondary">In Stock</Badge>
                  ) : (
                    <Badge variant="outline">Out of Stock</Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    disabled={!product.inStock}
                    onClick={() => addToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Artisan Spotlight */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Artisan Spotlight</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Meet the Artisans</h3>
              <p className="text-muted-foreground mb-4">
                Each product comes with a story of the skilled artisan who created it. 
                Learn about their heritage, techniques, and cultural significance behind each masterpiece.
              </p>
              <Button variant="outline">
                Learn More About Artisans
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div className="text-lg font-semibold">200+</div>
                <div className="text-sm text-muted-foreground">Artisan Regions</div>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="text-lg font-semibold">5000+</div>
                <div className="text-sm text-muted-foreground">Artisan Products</div>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div className="text-lg font-semibold">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PublicBrowsingInterface;