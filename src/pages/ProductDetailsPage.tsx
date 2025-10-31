import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EnhancedProduct } from '@/hooks/useSupabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, User, MapPin, Clock, Heart, Truck } from 'lucide-react';
import AppImage from '@/components/AppImage';
import { useLanguage } from '@/contexts/language-utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    console.log('handleAddToCart called');
    if (product) {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: discountedPrice,
        image: product.images[0]?.url,
        seller: product.seller,
        location: product.location,
      }, 1);
      toast({
        title: languageT('Added to Cart'),
        description: `${product.name} ${languageT('has been added to your cart.')}`,
      });
    }
  };

  const [product, setProduct] = useState<EnhancedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/product/${productId}`);
        if (response.data.success) {
          const data = response.data.product;
          // Adapt data to EnhancedProduct interface
          const adaptedProduct: EnhancedProduct = {
            id: data.id,
            name: data.name,
            price: data.price,
            unit: data.unit || 'piece',
            quantity: data.stock_quantity,
            seller: data.artisans?.name || 'Unknown Artisan',
            location: data.artisans?.location || 'Unknown Location',
            rating: data.rating || (Math.floor(Math.random() * 2) + 4), // Placeholder if not in DB
            images: data.images || [], // Assuming images is an array of ProductImage
            description: data.description,
            category: data.category,
            freshness: data.freshness || 'N/A',
            postedAt: new Date(data.created_at),
            isOrganic: data.is_organic || false,
            likesCount: data.likes_count || 0,
            savesCount: data.saves_count || 0,
            feedback: data.feedback || [],
            // Placeholder/derived values for new attributes
            discountPercentage: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0, // 40% chance of discount
            isTopSeller: Math.random() > 0.7, // 30% chance
            isNewArrival: Math.random() > 0.8, // 20% chance
            reviews: Math.floor(Math.random() * 50) + 10,
          };
          setProduct(adaptedProduct);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error("Error fetching product:", err.message);
        setError('Failed to load product details.');
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{languageT('Loading product details...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium mb-2">{languageT('Error')}: {error}</p>
          <Button onClick={() => window.history.back()}>{languageT('Go Back')}</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">{languageT('Product not found.')}</p>
          <Button onClick={() => window.history.back()}>{languageT('Go Back')}</Button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discountPercentage
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card rounded-lg shadow-lg p-6">
        {/* Product Image Gallery */}
        <div className="relative">
          <AppImage
            src={product.images[0]?.url || 'https://via.placeholder.com/600x400?text=No+Image'}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
          {/* Add more images/gallery here if available */}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.category}</p>

          <div className="flex items-center gap-3">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({product.reviews || 0} {languageT('Reviews')})</span>
          </div>

          <div className="flex items-baseline gap-3">
            {product.discountPercentage && product.discountPercentage > 0 ? (
              <>
                <span className="text-4xl font-bold text-destructive">₹{discountedPrice}</span>
                <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>
                <span className="text-lg font-semibold text-success">{product.discountPercentage}% OFF</span>
              </>
            ) : (
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
            )}
          </div>

          <p className="text-foreground leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Link to={`/artisan/${product.artisan_id}`} className="text-primary hover:underline">
                {product.seller}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{product.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{languageT('Posted')} {product.postedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiTruck className="h-4 w-4 text-muted-foreground" />
              <span>{languageT('Free Delivery')}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 flex items-center justify-center gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {languageT('Add to Cart')}
            </button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleWishlistToggle}
              className={isInWishlist(product.id) ? 'bg-accent text-accent-foreground' : ''}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailsPage;