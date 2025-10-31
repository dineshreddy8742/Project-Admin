import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { 
  ShoppingCart,
  Plus,
  Search,
  MapPin,
  Star,
  Clock,
  User,
  Phone,
  Package,
  Truck,
  CheckCircle,
  Calendar,
  Filter,
  Grid,
  List,
  Heart,
  MessageCircle,
  XCircle,
  Eye,
  Camera,
  ShoppingBag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ImageUpload } from '@/components/ImageUpload';
import { useSupabase, type EnhancedProduct, type ProductImage } from '@/hooks/useSupabase';
import eventBus from '@/lib/eventBus';

type MarketplaceMode = 'grocery' | 'artifacts';

// Legacy Product interface for backward compatibility
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  seller: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  category: string;
  freshness: string;
  postedAt: Date;
  isOrganic: boolean;
}

// Unified cart item interface
interface CartItem {
  id: string;
  name: string;
  price: number;
  cartQuantity: number;
  type: 'product' | 'artifact';
  // Product specific fields
  unit?: string;
  seller: string;
  location: string;
  images: ProductImage[] | string[];
  description: string;
  // Artifact specific fields
  condition?: string;
  category: string;
}

interface Artifact {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  location: string;
  rating: number;
  images: string[];
  description: string;
  condition: string;
  postedAt: Date;
  likes: number;
}

interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered';
  orderDate: Date;
  deliveryDate?: Date;
  deliveryAddress: string;
  paymentMethod: string;
  type: 'grocery' | 'artifact' | 'mixed';
}

const GroceryMarketplace = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  const { createProduct, loading } = useSupabase();
  
  // Main mode state
  const [mode, setMode] = useState<MarketplaceMode>('grocery');
  
  // Common states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Grocery states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    category: 'vegetables',
    isOrganic: false,
    location: '',
    seller: ''
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Artifacts states
  const [showAddArtifact, setShowAddArtifact] = useState(false);
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    price: '',
    category: 'tools',
    description: '',
    condition: 'excellent'
  });
  const [artifactImages, setArtifactImages] = useState<File[]>([]);

  // Orders states
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Mock data
  const [products, setProducts] = useState<EnhancedProduct[]>([
    {
      id: '1',
      name: 'Fresh Tomatoes',
      price: 45,
      unit: 'kg',
      quantity: 50,
      seller: 'Ramesh Kumar',
      location: 'Bangalore, Karnataka',
      rating: 4.5,
      images: [{ id: 'tomato-1', url: '🍅', alt: 'Fresh Tomatoes' }],
      description: 'Farm fresh red tomatoes, perfect for cooking and salads. Harvested yesterday.',
      category: 'vegetables',
      freshness: 'Very Fresh',
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOrganic: true,
      likesCount: 12,
      savesCount: 8,
      feedback: [
        {
          id: 'f1',
          userId: 'u1',
          userName: 'Priya Sharma',
          rating: 5,
          comment: 'Excellent quality tomatoes! Very fresh and tasty.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: '2',
      name: 'Organic Onions',
      price: 32,
      unit: 'kg',
      quantity: 30,
      seller: 'Sunita Devi',
      location: 'Mysore, Karnataka',
      rating: 4.8,
      images: [{ id: 'onion-1', url: '🧅', alt: 'Organic Onions' }],
      description: 'Certified organic onions with no pesticides. Great for daily cooking.',
      category: 'vegetables',
      freshness: 'Fresh',
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isOrganic: true,
      likesCount: 18,
      savesCount: 14,
      feedback: []
    },
    {
      id: '3',
      name: 'Basmati Rice',
      price: 85,
      unit: 'kg',
      quantity: 100,
      seller: 'Krishnan Farms',
      location: 'Hassan, Karnataka',
      rating: 4.7,
      images: [{ id: 'rice-1', url: '🌾', alt: 'Basmati Rice' }],
      description: 'Premium quality basmati rice with authentic aroma and taste.',
      category: 'grains',
      freshness: 'Excellent',
      postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isOrganic: false,
      likesCount: 25,
      savesCount: 20,
      feedback: []
    },
    {
      id: '4',
      name: 'Fresh Mangoes',
      price: 120,
      unit: 'kg',
      quantity: 25,
      seller: 'Mango Valley Farm',
      location: 'Belgaum, Karnataka',
      rating: 4.9,
      images: [{ id: 'mango-1', url: '🥭', alt: 'Fresh Mangoes' }],
      description: 'Sweet Alphonso mangoes directly from our orchard. Limited stock available.',
      category: 'fruits',
      freshness: 'Very Fresh',
      postedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isOrganic: true,
      likesCount: 32,
      savesCount: 28,
      feedback: []
    }
  ]);

  const [artifacts, setArtifacts] = useState<Artifact[]>([
    {
      id: '1',
      name: 'Vintage Brass Plow',
      price: 15000,
      category: 'tools',
      seller: 'Heritage Farm Tools',
      location: 'Mysore, Karnataka',
      rating: 4.8,
      images: ['🪓'],
      description: 'Authentic vintage brass plow from the 1950s. Well-maintained and functional.',
      condition: 'excellent',
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 23
    },
    {
      id: '2',
      name: 'Traditional Clay Pottery Set',
      price: 2500,
      category: 'pottery',
      seller: 'Kumar Pottery Works',
      location: 'Bangalore, Karnataka',
      rating: 4.6,
      images: ['🏺'],
      description: 'Handmade clay pots and vessels, perfect for traditional cooking and storage.',
      condition: 'good',
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 18
    }
  ]);


  // Categories
  const groceryCategories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' }
  ];

  const artifactCategories = [
    { id: 'all', name: 'All Categories', icon: '📦' },
    { id: 'tools', name: 'Farm Tools', icon: '🔨' },
    { id: 'pottery', name: 'Pottery', icon: '🏺' },
    { id: 'storage', name: 'Storage', icon: '🫙' },
    { id: 'decorative', name: 'Decorative', icon: '🎨' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  // Filtered data based on current mode
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artifact.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || artifact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper functions
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'out-for-delivery':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-success';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Event handlers for grocery
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit,
      quantity: parseInt(newProduct.quantity),
      seller: newProduct.seller || 'Your Farm',
      location: newProduct.location || 'Your Location',
      rating: 4.0,
      description: newProduct.description,
      category: newProduct.category,
      freshness: 'Fresh',
      isOrganic: newProduct.isOrganic,
    };

    const createdProduct = await createProduct(productData, productImages);
    
    if (createdProduct) {
      setProducts(prevProducts => [...prevProducts, createdProduct]);
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        price: '',
        unit: 'kg',
        quantity: '',
        description: '',
        category: 'vegetables',
        isOrganic: false,
        location: '',
        seller: ''
      });
      setProductImages([]);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (images: ProductImage[] | string[]): string => {
    if (Array.isArray(images) && images.length > 0) {
      return typeof images[0] === 'string' ? images[0] : images[0].url || '📦';
    }
    return '📦';
  };

  // Unified cart functions
  const addToCart = (item: EnhancedProduct | Artifact, type?: 'product' | 'artifact') => {
    // Determine type if not provided (for backward compatibility with ProductDetailModal)
    const itemType = type || ('unit' in item ? 'product' : 'artifact');
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id && cartItem.type === itemType);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id && cartItem.type === itemType 
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 } 
            : cartItem
        );
      } else {
        const cartItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          cartQuantity: 1,
          type: itemType,
          seller: item.seller,
          location: item.location,
          images: item.images,
          description: item.description,
          category: item.category,
          ...(itemType === 'product' && 'unit' in item && { unit: item.unit }),
          ...(itemType === 'artifact' && 'condition' in item && { condition: item.condition }),
        };
        
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        });
        return [...prevItems, cartItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, cartQuantity: newQuantity } : item
      );
    });
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const isFavorited = prev.includes(productId);
      if (isFavorited) {
        toast({
          title: "Removed from favorites",
          description: "Product removed from your favorites list.",
        });
        return prev.filter(id => id !== productId);
      } else {
        toast({
          title: "Added to favorites",
          description: "Product added to your favorites list.",
        });
        return [...prev, productId];
      }
    });
  };

  const openProductDetail = (product: EnhancedProduct) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleProceedToPayment = () => {
    const orderId = Date.now().toString();
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    
    // Determine order type
    const hasProducts = cartItems.some(item => item.type === 'product');
    const hasArtifacts = cartItems.some(item => item.type === 'artifact');
    let orderType: 'grocery' | 'artifact' | 'mixed' = 'grocery';
    if (hasProducts && hasArtifacts) {
      orderType = 'mixed';
    } else if (hasArtifacts) {
      orderType = 'artifact';
    }
    
    const order: Order = {
      id: orderId,
      items: [...cartItems],
      totalAmount,
      status: 'confirmed',
      orderDate: new Date(),
      deliveryAddress: 'Your Address, City, State', // Mock address
      paymentMethod: 'Cash on Delivery',
      type: orderType
    };
    
    // Add to user orders
    setUserOrders(prevOrders => [order, ...prevOrders]);
    setCurrentOrder(order);
    setShowOrderConfirmation(true);
    setShowCart(false);
  };

  // Event handlers for artifacts
  const handleAddArtifact = () => {
    if (!newArtifact.name || !newArtifact.price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const artifact: Artifact = {
      id: Date.now().toString(),
      name: newArtifact.name,
      price: parseFloat(newArtifact.price),
      category: newArtifact.category,
      seller: 'Your Shop', // Mock seller
      location: 'Your Location', // Mock location
      rating: 4.0,
      images: ['📦'], // Mock image
      description: newArtifact.description,
      condition: newArtifact.condition,
      postedAt: new Date(),
      likes: 0
    };

    setArtifacts(prev => [artifact, ...prev]);
    setShowAddArtifact(false);
    setNewArtifact({
      name: '',
      price: '',
      category: 'tools',
      description: '',
      condition: 'excellent'
    });
    setArtifactImages([]);

    toast({
      title: "Artifact listed",
      description: "Your artifact has been listed successfully!",
    });
  };

  const resetToGrocery = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: string }) => {
        if (field === 'searchQuery') {
            setSearchQuery(value);
        } else if (field === 'category') {
            const category = groceryCategories.find(c => c.name.toLowerCase() === value.toLowerCase());
            if (category) {
                setSelectedCategory(category.id);
            }
        }
    };

    eventBus.on('fill-grocery-marketplace-field', handleFillField);

    return () => {
        eventBus.remove('fill-grocery-marketplace-field', handleFillField);
    };
  }, [groceryCategories]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-hero text-primary font-indian mb-2">
            {mode === 'grocery' ? '🛒' : '🏺'} {translateSync(mode === 'grocery' ? 'Grocery Marketplace' : 'Artifacts Marketplace')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync(mode === 'grocery' ? 'Buy and sell fresh groceries directly from farmers' : 'Buy and sell traditional farming artifacts and tools')}
          </p>
        </motion.div>

        {/* Mode Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="bg-muted p-1 rounded-lg">
            <Button
              variant={mode === 'grocery' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setMode('grocery');
                resetToGrocery();
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: mode === 'grocery' ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Grocery Market
              </motion.div>
            </Button>
            <Button
              variant={mode === 'artifacts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setMode('artifacts');
                resetToGrocery();
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: mode === 'artifacts' ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Package className="h-4 w-4 mr-2" />
                Artifacts
              </motion.div>
            </Button>
          </div>
        </motion.div>

        {/* Main Content based on mode */}
        <AnimatePresence mode="wait">
          {mode === 'grocery' ? (
            <motion.div
              key="grocery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Search and Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={translateSync("Search products, sellers...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={() => setShowOrders(true)} variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Orders ({userOrders.length})
                  </Button>
                  
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {translateSync('Sell Product')}
                  </Button>
                  
                  <Dialog open={showCart} onOpenChange={setShowCart}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="relative">
                        <ShoppingCart className="h-4 w-4" />
                        {cartItems.length > 0 && (
                          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                            {cartItems.reduce((total, item) => total + item.cartQuantity, 0)}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{translateSync('Your Cart')}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        {cartItems.length === 0 ? (
                          <p className="text-center text-muted-foreground">{translateSync('Your cart is empty.')}</p>
                        ) : (
                          <div className="space-y-3">
                            {cartItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">
                                  {getImageUrl(item.images)}
                                </span>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ₹{item.price}{item.unit ? `/${item.unit}` : ''}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {item.type === 'product' ? 'Grocery' : 'Artifact'}
                                  </Badge>
                                </div>
                              </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}>-</Button>
                                  <span>{item.cartQuantity}</span>
                                  <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}>+</Button>
                                  <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {cartItems.length > 0 && (
                        <DialogFooter className="flex flex-col sm:flex-col sm:space-x-0 sm:space-y-2">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>{translateSync('Total:')}</span>
                            <span>₹{cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0).toFixed(2)}</span>
                          </div>
                          <Button className="w-full" onClick={handleProceedToPayment}>
                            {translateSync('Proceed to Payment')}
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {groceryCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Products Grid/List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                : "space-y-4"
              }>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className={`hover:shadow-glow transition-all ${
                        viewMode === 'list' ? 'flex flex-row' : ''
                      }`}>
                        {viewMode === 'grid' ? (
                          <>
                            <CardHeader className="text-center pb-2">
                              <div className="text-6xl mb-2">{product.images[0]?.url || '📦'}</div>
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <div className="flex justify-center space-x-2">
                                {product.isOrganic && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Organic
                                  </Badge>
                                )}
                                <Badge variant="outline">{product.freshness}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  ₹{product.price}
                                  <span className="text-sm text-muted-foreground">/{product.unit}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {product.quantity} {product.unit} available
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground text-center">
                                {product.description}
                              </p>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>{product.seller}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{product.rating}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{product.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimeAgo(product.postedAt)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-2 pt-2">
                              <Button className="flex-1" size="sm" onClick={() => addToCart(product, 'product')}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openProductDetail(product)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <motion.div whileTap={{ scale: 0.9 }}>
                                  <Button 
                                    variant={favorites.includes(product.id) ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => toggleFavorite(product.id)}
                                  >
                                    <motion.div
                                      animate={{ 
                                        scale: favorites.includes(product.id) ? [1, 1.3, 1] : 1,
                                        rotate: favorites.includes(product.id) ? [0, 15, -15, 0] : 0 
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Heart 
                                        className={`h-4 w-4 ${
                                          favorites.includes(product.id) 
                                            ? 'text-red-500 fill-red-500' 
                                            : ''
                                        }`} 
                                      />
                                    </motion.div>
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </>
                        ) : (
                          // List View
                          <div className="flex w-full">
                            <div className="w-20 h-20 flex items-center justify-center text-4xl">
                              {product.images[0]?.url || '📦'}
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{product.name}</h3>
                                  <p className="text-sm text-muted-foreground">{product.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{product.seller}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{product.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span>{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-primary">
                                    ₹{product.price}/{product.unit}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.quantity} {product.unit} available
                                  </div>
                                  <div className="flex space-x-2 mt-2">
                                  <Button size="sm" onClick={() => addToCart(product, 'product')}>
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                  </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => openProductDetail(product)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant={favorites.includes(product.id) ? "default" : "outline"} 
                                        size="sm"
                                        onClick={() => toggleFavorite(product.id)}
                                      >
                                        <motion.div
                                          animate={{ 
                                            scale: favorites.includes(product.id) ? [1, 1.3, 1] : 1,
                                            rotate: favorites.includes(product.id) ? [0, 15, -15, 0] : 0 
                                          }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <Heart 
                                            className={`h-4 w-4 ${
                                              favorites.includes(product.id) 
                                                ? 'text-red-500 fill-red-500' 
                                                : ''
                                            }`} 
                                          />
                                        </motion.div>
                                      </Button>
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or browse different categories
                  </p>
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Be the first to sell
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="artifacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search and Controls for Artifacts */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={translateSync("Search artifacts...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={() => setShowOrders(true)} variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Orders ({userOrders.length})
                  </Button>
                  
                  <Button onClick={() => setShowAddArtifact(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    List Artifact
                  </Button>
                  
                  <Dialog open={showCart} onOpenChange={setShowCart}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="relative">
                        <ShoppingCart className="h-4 w-4" />
                        {cartItems.length > 0 && (
                          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                            {cartItems.reduce((total, item) => total + item.cartQuantity, 0)}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{translateSync('Your Cart')}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        {cartItems.length === 0 ? (
                          <p className="text-center text-muted-foreground">{translateSync('Your cart is empty.')}</p>
                        ) : (
                          <div className="space-y-3">
                        {cartItems.map(item => (
                          <div key={`${item.id}-${item.type}`} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">
                                {getImageUrl(item.images)}
                              </span>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ₹{item.price}{item.unit ? `/${item.unit}` : ''}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {item.type === 'product' ? 'Grocery' : 'Artifact'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}>-</Button>
                              <span>{item.cartQuantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}>+</Button>
                              <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                          </div>
                        )}
                      </div>
                      {cartItems.length > 0 && (
                        <DialogFooter className="flex flex-col sm:flex-col sm:space-x-0 sm:space-y-2">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>{translateSync('Total:')}</span>
                            <span>₹{cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0).toFixed(2)}</span>
                          </div>
                          <Button className="w-full" onClick={handleProceedToPayment}>
                            {translateSync('Proceed to Payment')}
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Artifact Categories */}
              <div className="flex flex-wrap gap-2">
                {artifactCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Artifacts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
                      <Card className="hover:shadow-glow transition-all">
                        <CardHeader className="text-center pb-2">
                          <div className="text-6xl mb-2">{artifact.images[0]}</div>
                          <CardTitle className="text-lg">{artifact.name}</CardTitle>
                          <div className="flex justify-center space-x-2">
                            <Badge className={getConditionColor(artifact.condition)}>
                              {artifact.condition}
                            </Badge>
                            <Badge variant="outline">{artifact.category}</Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              ₹{artifact.price.toLocaleString()}
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground text-center">
                            {artifact.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{artifact.seller}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{artifact.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{artifact.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(artifact.postedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button className="flex-1" size="sm" onClick={() => addToCart(artifact, 'artifact')}>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button 
                                variant={favorites.includes(artifact.id) ? "default" : "outline"} 
                                size="sm"
                                onClick={() => toggleFavorite(artifact.id)}
                              >
                                <motion.div
                                  animate={{ 
                                    scale: favorites.includes(artifact.id) ? [1, 1.3, 1] : 1,
                                    rotate: favorites.includes(artifact.id) ? [0, 15, -15, 0] : 0 
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${
                                      favorites.includes(artifact.id) 
                                        ? 'text-red-500 fill-red-500' 
                                        : ''
                                    }`} 
                                  />
                                </motion.div>
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty State for artifacts */}
              {filteredArtifacts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No artifacts found</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to list an artifact in this category
                  </p>
                  <Button onClick={() => setShowAddArtifact(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    List First Artifact
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={showProductDetail}
          onClose={() => setShowProductDetail(false)}
          onAddToCart={addToCart}
        />

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddProduct(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Product Images</Label>
                      <ImageUpload 
                        onImagesChange={setProductImages}
                        maxImages={5}
                        onRemoveExisting={() => {}}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Product Name *</Label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="e.g., Fresh Tomatoes"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Category *</Label>
                        <Select 
                          value={newProduct.category} 
                          onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="fruits">Fruits</SelectItem>
                            <SelectItem value="grains">Grains</SelectItem>
                            <SelectItem value="dairy">Dairy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Price *</Label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="45"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Unit *</Label>
                        <Select 
                          value={newProduct.unit} 
                          onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="gram">gram</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                            <SelectItem value="dozen">dozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Quantity Available *</Label>
                        <Input
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                          placeholder="50"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Seller Name</Label>
                        <Input
                          value={newProduct.seller}
                          onChange={(e) => setNewProduct({...newProduct, seller: e.target.value})}
                          placeholder="Your Farm Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <Input
                          value={newProduct.location}
                          onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                          placeholder="City, State"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Describe your product, its quality, freshness, etc..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="organic"
                        checked={newProduct.isOrganic}
                        onCheckedChange={(checked) => setNewProduct({...newProduct, isOrganic: checked})}
                      />
                      <Label htmlFor="organic" className="text-sm">This is an organic product</Label>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={handleAddProduct} 
                        className="flex-1"
                        disabled={loading}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {loading ? 'Creating...' : 'List Product'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Artifact Modal */}
        <AnimatePresence>
          {showAddArtifact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddArtifact(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>List New Artifact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Artifact Images</Label>
                      <ImageUpload 
                        onImagesChange={setArtifactImages}
                        maxImages={5}
                        onRemoveExisting={() => {}}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Artifact Name *</Label>
                        <Input
                          value={newArtifact.name}
                          onChange={(e) => setNewArtifact({...newArtifact, name: e.target.value})}
                          placeholder="e.g., Vintage Brass Plow"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Category *</Label>
                        <Select 
                          value={newArtifact.category} 
                          onValueChange={(value) => setNewArtifact({...newArtifact, category: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tools">Farm Tools</SelectItem>
                            <SelectItem value="pottery">Pottery</SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="decorative">Decorative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Price *</Label>
                        <Input
                          type="number"
                          value={newArtifact.price}
                          onChange={(e) => setNewArtifact({...newArtifact, price: e.target.value})}
                          placeholder="15000"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Condition *</Label>
                        <Select 
                          value={newArtifact.condition} 
                          onValueChange={(value) => setNewArtifact({...newArtifact, condition: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.map((condition) => (
                              <SelectItem key={condition.value} value={condition.value}>
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newArtifact.description}
                        onChange={(e) => setNewArtifact({...newArtifact, description: e.target.value})}
                        placeholder="Describe the artifact, its history, condition, etc..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleAddArtifact} className="flex-1">
                        <Package className="h-4 w-4 mr-2" />
                        List Artifact
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddArtifact(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Modal */}
        <AnimatePresence>
          {showOrders && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowOrders(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>My Orders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-glow transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <span>Order #{order.id}</span>
                                  <Badge variant="outline" className="capitalize">
                                    {order.type}
                                  </Badge>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(order.orderDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{order.deliveryAddress}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">₹{order.totalAmount.toFixed(2)}</div>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 text-sm">Items Ordered:</h4>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                      {getImageUrl(item.images)}
                                    </span>
                                    <div>
                                      <span className="font-medium">{item.name} x {item.cartQuantity}</span>
                                      <div className="flex items-center space-x-1">
                                        <Badge variant="outline" className="text-xs">
                                          {item.type === 'product' ? 'Grocery' : 'Artifact'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                    <span className="font-medium">₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                              </Button>
                              
                              {order.status !== 'delivered' && (
                                <Button variant="outline" size="sm">
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact Seller
                                </Button>
                              )}
                            </div>

                            <AnimatePresence>
                              {selectedOrder === order.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t pt-4 space-y-3 overflow-hidden"
                                >
                                  <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Order Date:</span>
                                      <span>{formatDate(order.orderDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Payment Method:</span>
                                      <span>{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Order Type:</span>
                                      <Badge variant="outline" className="capitalize">
                                        {order.type}
                                      </Badge>
                                    </div>
                                    {order.deliveryDate && (
                                      <div className="flex justify-between">
                                        <span className="font-medium">Delivered On:</span>
                                        <span className="text-success">{formatDate(order.deliveryDate)}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">Delivery Address:</span>
                                      <p className="text-muted-foreground mt-1">{order.deliveryAddress}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                    {userOrders.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-muted-foreground">
                          Start shopping to see your orders here
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button variant="outline" onClick={() => setShowOrders(false)}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Confirmation Modal */}
        <AnimatePresence>
          {showOrderConfirmation && currentOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="w-full max-w-lg"
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-success-foreground to-success"></div>
                  
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-6xl text-success mx-auto mb-2"
                    >
                      ✅
                    </motion.div>
                    <CardTitle className="text-2xl text-success">Order Confirmed!</CardTitle>
                    <p className="text-muted-foreground">Your order has been placed successfully</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Order ID:</span>
                        <span className="text-primary font-mono">#{currentOrder.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-xl font-bold text-success">₹{currentOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Method:</span>
                        <span>{currentOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Delivery Address:</span>
                        <span className="text-right text-sm">{currentOrder.deliveryAddress}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {currentOrder.items.map((item: CartItem) => (
                          <div key={`${item.id}-${item.type}`} className="flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {getImageUrl(item.images)}
                              </span>
                              <div>
                                <span className="font-medium">{item.name} x {item.cartQuantity}</span>
                                <div>
                                  <Badge variant="outline" className="text-xs">
                                    {item.type === 'product' ? 'Grocery' : 'Artifact'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <span>₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        className="flex-1" 
                        onClick={() => {
                          setShowOrderConfirmation(false);
                          setCartItems([]);
                          toast({
                            title: "Order placed successfully!",
                            description: "You can view your order in the Orders section.",
                          });
                        }}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default GroceryMarketplace;
