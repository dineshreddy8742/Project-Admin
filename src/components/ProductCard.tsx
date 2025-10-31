import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiStar, FiTruck } from 'react-icons/fi';
import { ShoppingCart, Check } from 'lucide-react';
import AppImage from '@/components/AppImage';
import { useLanguage } from '@/contexts/language-utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    discountPercentage?: number;
    image: string;
    rating?: number;
    reviews?: number;
    isTopSeller?: boolean;
    isNewArrival?: boolean;
    seller?: string;
    location?: string;
  };
  isInWishlist: boolean;
  onWishlistToggle: (product: any) => void; // Adjust type as needed
  onCategoryClick: (category: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, isInWishlist, onWishlistToggle, onCategoryClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t: languageT } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Preload first few images
  useEffect(() => {
    if (product.image && !imageLoaded) {
      const img = new Image();
      img.src = product.image;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
    }
  }, [product.image, handleImageLoad, handleImageError, imageLoaded]);

  const discountedPrice = product.discountPercentage
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) {
      console.log('Already adding to cart, ignoring click');
      return;
    }
    
    setIsAddingToCart(true);
    
    const cartItem = {
      id: `cart-${Date.now()}`, // Unique cart item id
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.seller || 'Unknown Artisan',
      location: product.location || 'Unknown Location'
    };
    
    console.log('ProductCard: Adding item to cart:', cartItem);
    addToCart(cartItem, 1);
    console.log('ProductCard: Item added to cart, will navigate to cart page');
    
    // Show toast notification
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
    
    // Show visual feedback on button
    const button = e.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="animate-pulse flex items-center"><Check className="w-4 h-4 mr-1" /> Added!</span>';
    button.classList.add('bg-green-500', 'text-white');
    button.disabled = true;
    
    // Navigate to cart page after adding item
    setTimeout(() => {
      setIsAddingToCart(false);
      console.log('ProductCard: Finished adding to cart, navigating to cart page');
      // Restore button state
      button.innerHTML = originalText;
      button.classList.remove('bg-green-500', 'text-white');
      button.disabled = false;
      navigate('/cart');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 w-64"
    >
      <Link
        to={`/product/${product.id}`}
        className="group bg-card rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block relative"
      >
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle(product);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-background rounded-full shadow-md hover:bg-muted transition-colors"
          aria-label={isInWishlist ? languageT('Remove from wishlist') : languageT('Add to wishlist')}
        >
          <FiHeart
            className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-muted-foreground'}`}
          />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`absolute top-3 right-12 z-10 p-2 rounded-full shadow-md transition-colors ${
            isInCart(product.id) 
              ? 'bg-green-500 text-white' 
              : isAddingToCart 
                ? 'bg-blue-500 text-white' 
                : 'bg-background hover:bg-muted'
          }
          aria-label={isInCart(product.id) ? languageT('In cart') : languageT('Add to cart')}
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center w-5 h-5">
              <span className="animate-pulse">•</span>
            </span>
          ) : isInCart(product.id) ? (
            <span className="text-xs">✓</span>
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
        </button>

        {/* Product Image with lazy loading */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-muted w-full h-full rounded"></div>
            </div>
          )}
          {!imageError ? (
            <AppImage
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
              <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">{languageT('Image unavailable')}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h4>
          <p className="text-sm text-muted-foreground mb-2">{product.category}</p>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 4) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">({product.reviews || 24})</span>
          </div>

          <div className="flex justify-between items-center mt-3">
            {product.discountPercentage && product.discountPercentage > 0 ? (
              <div className="flex flex-col">
                <span className="text-muted-foreground line-through text-sm">₹{product.price}</span>
                <span className="text-destructive font-bold text-lg">
                  ₹{discountedPrice}
                </span>
              </div>
            ) : (
              <span className="text-primary font-bold text-lg">₹{product.price}</span>
            )}
            <span className="text-xs text-muted-foreground flex items-center">
              <FiTruck className="mr-1" /> {languageT('Free delivery')}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;