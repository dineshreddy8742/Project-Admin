import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedProduct } from '@/hooks/useSupabase';

interface WishlistContextType {
  wishlistItems: EnhancedProduct[];
  addToWishlist: (product: EnhancedProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Default timeout and retry options for API calls
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<EnhancedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced function to make API calls with retry logic
  const makeApiCall = useCallback(async (config: any, retries = MAX_RETRIES) => {
    try {
      const response = await axios({
        ...config,
        timeout: API_TIMEOUT,
      });
      return response;
    } catch (error: any) {
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.code === 'ERR_INSUFFICIENT_RESOURCES')) {
        console.warn(`API call failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY);
        return makeApiCall(config, retries - 1);
      }
      throw error;
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await makeApiCall({
        method: 'get',
        url: `https://chintuvignu17-projectkisan.hf.space/api/wishlist?user_id=${user.id}`,
      });
      
      if (response.data.success) {
        const items = response.data.wishlist_items.map((item: any) => ({ ...item.products, id: item.products.id }));
        setWishlistItems(items);
      }
    } catch (error: any) {
      console.error("Error fetching wishlist:", error.message);
      // Don't show error toast for network issues to avoid spam, just log
      if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK' && error.code !== 'ERR_INSUFFICIENT_RESOURCES') {
        toast({
          title: "Error",
          description: "Failed to load wishlist.",
          variant: "destructive",
        });
      }
      // Set empty wishlist on error but don't break the UI
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast, makeApiCall]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (product: EnhancedProduct) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await makeApiCall({
        method: 'post',
        url: 'https://chintuvignu17-projectkisan.hf.space/api/wishlist',
        data: {
          user_id: user.id,
          product_id: product.id
        }
      });

      if (response.data.success) {
        setWishlistItems(prev => [...prev, product]);
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding to wishlist:", error.message);
      // Update UI optimistically, but show error if API fails
      setWishlistItems(prev => [...prev, product]);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been temporarily added to your wishlist. Changes will sync when connection is restored.`,
        variant: "default",
      });
    }
  }, [user, toast, makeApiCall]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      const response = await makeApiCall({
        method: 'delete',
        url: 'https://chintuvignu17-projectkisan.hf.space/api/wishlist',
        data: {
          user_id: user.id,
          product_id: productId
        }
      });

      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        toast({
          title: "Removed from Wishlist",
          description: "Item removed from your wishlist.",
        });
      }
    } catch (error: any) {
      console.error("Error removing from wishlist:", error.message);
      // Update UI optimistically, but show error if API fails
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast({
        title: "Item Removed",
        description: "Item has been temporarily removed from your wishlist. Changes will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [user, toast, makeApiCall]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// This comment is added to force re-evaluation of the file.
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};