import React, { createContext, useContext, useReducer, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  seller: string;
  location: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  total: 0
};

// For development/testing, add some sample items to the cart
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing cart with sample items for development');
  // Don't actually modify the initial state, but log that we're in dev mode
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log('Cart reducer called with action:', action);
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('Adding item:', action.payload);
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      console.log('Existing item:', existingItem);
      
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }
      console.log('Updated items:', updatedItems);

      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      console.log('New total:', total);
      const newState = { items: updatedItems, total };
      console.log('New state:', newState);
      return newState;
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.productId !== action.payload.productId);
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, total };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.productId !== action.payload.productId),
          total: state.items
            .filter(item => item.productId !== action.payload.productId)
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
        };
      }

      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, total };
    }
    
    case 'CLEAR_CART': {
      return { items: [], total: 0 };
    }
    
    case 'SET_CART': {
      return action.payload;
    }
    
    default:
      return state;
  }
};

interface CartContextType {
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      console.log('Attempting to load cart from localStorage, found:', savedCart);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart data:', parsedCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
        console.log('Loaded cart from localStorage:', parsedCart);
      } else {
        console.log('No saved cart found in localStorage');
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // For development/testing, add some sample items to the cart
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialized && cart.items.length === 0) {
      const sampleItem = {
        id: 'sample-product-1',
        productId: 'sample-product-1',
        name: 'Sample Product',
        price: 100,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
        seller: 'Sample Seller',
        location: 'Sample Location',
      };
      dispatch({ type: 'ADD_ITEM', payload: sampleItem });
      console.log('Initialized cart with sample item for development.');
    }
  }, [isInitialized, cart.items.length]);

  // Debug: Log cart state changes
  useEffect(() => {
    console.log('Cart state updated:', cart);
  }, [cart]);
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('CartContext: Adding item to cart:', item, 'Quantity:', quantity);
    const newItem = {
      ...item,
      quantity
    };
    console.log('CartContext: Dispatching ADD_ITEM with payload:', newItem);
    dispatch({
      type: 'ADD_ITEM',
      payload: newItem
    });
    console.log('CartContext: Item added to cart successfully');
  };

  const removeFromCart = (productId: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string): boolean => {
    console.log('Checking if product is in cart:', productId);
    console.log('Current cart items:', cart.items);
    const result = cart.items.some(item => item.productId === productId);
    console.log('Is in cart result:', result);
    return result;
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};