import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, MapPin, IndianRupee, Star, Clock, TrendingUp, Heart, ShoppingCart, Package } from 'lucide-react';

const SearchDiscoveryFeatures = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock data for search
  const mockProducts = [
    {
      id: 1,
      name: 'Kanchipuram Silk Saree - Royal Blue',
      artisan: 'Smt. Meenakshi',
      region: 'Tamil Nadu',
      description: 'Authentic Kanchipuram silk saree with traditional zari work',
      price: 12000,
      rating: 4.8,
      category: 'textiles',
      tags: ['saree', 'silk', 'traditional', 'wedding'],
      stock: true,
      images: ['kanchipuram1.jpg'],
      timeToMake: '2 weeks',
      popularity: 95
    },
    {
      id: 2,
      name: 'Blue Pottery Handi',
      artisan: 'Sh. Rajesh Kumar',
      region: 'Rajasthan',
      description: 'Handcrafted blue pottery handi with traditional Rajasthani designs',
      price: 2500,
      rating: 4.6,
      category: 'pottery',
      tags: ['pottery', 'blue', 'functional', 'decorative'],
      stock: true,
      images: ['bluepottery1.jpg'],
      timeToMake: '3 days',
      popularity: 88
    },
    {
      id: 3,
      name: 'Warli Tribal Painting',
      artisan: 'Sh. Sanjay Pawar',
      region: 'Maharashtra',
      description: 'Traditional Warli tribal painting on canvas',
      price: 8500,
      rating: 4.9,
      category: 'paintings',
      tags: ['painting', 'tribal', 'canvas', 'art'],
      stock: true,
      images: ['warli1.jpg'],
      timeToMake: '1 week',
      popularity: 92
    },
    {
      id: 4,
      name: 'Bidriware Pen Stand',
      artisan: 'Smt. Fatima Khan',
      region: 'Karnataka',
      description: 'Intricate Bidriware pen stand with silver inlay work',
      price: 3200,
      rating: 4.7,
      category: 'metalwork',
      tags: ['metalwork', 'pen-stand', 'office', 'traditional'],
      stock: false,
      images: ['bidri1.jpg'],
      timeToMake: '1 week',
      popularity: 78
    },
    {
      id: 5,
      name: 'Madhubani Painting',
      artisan: 'Smt. Shanti Devi',
      region: 'Bihar',
      description: 'Vibrant Madhubani painting featuring nature motifs',
      price: 7200,
      rating: 4.8,
      category: 'paintings',
      tags: ['painting', 'nature', 'colors', 'traditional'],
      stock: true,
      images: ['madhubani1.jpg'],
      timeToMake: '5 days',
      popularity: 85
    },
    {
      id: 6,
      name: 'Channapatna Wooden Toys',
      artisan: 'Sh. Ravi Gowda',
      region: 'Karnataka',
      description: 'Colorful wooden toys painted with vegetable dyes',
      price: 1500,
      rating: 4.5,
      category: 'woodwork',
      tags: ['toys', 'wooden', 'children', 'eco-friendly'],
      stock: true,
      images: ['woodentoys1.jpg'],
      timeToMake: '4 days',
      popularity: 90
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'textiles', label: 'Textiles & Weaving' },
    { value: 'pottery', label: 'Pottery & Ceramics' },
    { value: 'paintings', label: 'Traditional Paintings' },
    { value: 'metalwork', label: 'Metalwork' },
    { value: 'woodwork', label: 'Woodwork' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'sculpture', label: 'Sculpture' }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'bihar', label: 'Bihar' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' }
  ];

  // Tags for filtering
  const allTags = ['saree', 'silk', 'traditional', 'wedding', 'pottery', 'blue', 'functional', 'decorative', 'painting', 'tribal', 'canvas', 'art', 'metalwork', 'pen-stand', 'office', 'toys', 'wooden', 'children', 'eco-friendly', 'nature', 'colors', 'sculpture', 'handicrafts', 'jewelry', 'ornamental'];

  // Search suggestions
  const searchSuggestions = [
    'Kanchipuram Silk Saree',
    'Blue Pottery',
    'Warli Painting',
    'Bidriware Items',
    'Madhubani Art',
    'Channapatna Toys',
    'Tanjore Painting',
    'Banarasi Silk',
    'Phulkari Embroidery',
    'Kantha Work'
  ];

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...mockProducts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(query)) ||
        product.artisan.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(product => product.region.toLowerCase().replace(/\s+/g, '_') === selectedRegion);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product => 
        selectedTags.every(tag => product.tags.includes(tag))
      );
    }

    // Sort results
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'newest':
        // In a real implementation, we'd sort by creation date
        break;
      default:
        // Default: sort by relevance (could be based on search terms match)
        break;
    }

    setResults(filtered);
  }, [searchQuery, selectedCategory, selectedRegion, priceRange, sortBy, selectedTags]);

  // Update suggestions based on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filteredSuggestions = searchSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSearch = () => {
    toast({
      title: "Search Results",
      description: `Found ${results.length} items matching your search.`
    });
  };

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setPriceRange([0, 20000]);
    setSortBy('relevance');
    setSelectedTags([]);
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
            <Search className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Discover Indian Artisan Treasures
            </h1>
            <p className="text-lg text-muted-foreground">
              Search, filter, and discover authentic Indian handicrafts
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar with Suggestions */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Artisan Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for crafts, regions, artisans, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
                {suggestions.length > 0 && searchQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-2 hover:bg-secondary cursor-pointer"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setSuggestions([]);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
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

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="bg-background"
                  placeholder="Min"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="bg-background"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tag Filter */}
          <div className="mt-6">
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Showing {results.length} products
          {searchQuery && ` for "${searchQuery}"`}
          {selectedTags.length > 0 && ` tagged with ${selectedTags.join(', ')}`}
        </p>
        <div className="text-sm text-muted-foreground">
          {selectedCategory !== 'all' && `Category: ${categories.find(c => c.value === selectedCategory)?.label}, `}
          {selectedRegion !== 'all' && `Region: ${regions.find(r => r.value === selectedRegion)?.label}`}
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-glow transition-all bg-card overflow-hidden">
                <div className="relative">
                  <div className="bg-secondary w-full h-48 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2"
                    onClick={() => addToWishlist(product.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-card-title text-primary font-indian text-base">
                    {product.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{product.region}</span>
                    </div>
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
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{product.popularity}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{product.timeToMake}</span>
                    </div>
                    <div>
                      {product.stock ? (
                        <Badge variant="secondary">In Stock</Badge>
                      ) : (
                        <Badge variant="outline">Out of Stock</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      disabled={!product.stock}
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button onClick={clearFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Popular Searches */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Popular Search Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Kanchipuram Sarees', 'Blue Pottery', 'Warli Art', 'Bidriware', 'Madhubani', 'Channapatna Toys', 'Tanjore Painting', 'Banarasi Silk'].map((category, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSearchQuery(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SearchDiscoveryFeatures;