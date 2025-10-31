import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, X, Package, IndianRupee } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  console.log('Cart page rendered with cart:', cart);
  const navigate = useNavigate();

  // Debug: Log when cart items change
  useEffect(() => {
    console.log('Cart items updated:', cart.items);
    console.log('Cart total updated:', cart.total);
  }, [cart.items, cart.total]);

  const handleCheckout = () => {
    // Redirect to checkout page
    navigate('/checkout');
  };

  if (cart.items.length === 0) {
    return (
      <div className="space-y-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/marketplace')}
              className="bg-primary hover:bg-primary/90"
            >
              Continue Shopping
            </Button>
            <p className="text-sm text-muted-foreground">
              Add items to your cart and they'll appear here
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-primary mb-2">Your Shopping Cart</h1>
        <p className="text-muted-foreground">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 flex items-center space-x-4"
            >
              <div className="bg-muted rounded-lg w-24 h-24 flex items-center justify-center flex-shrink-0">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground">by {item.seller}</p>
                <p className="text-sm text-muted-foreground">{item.location}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="text-center w-10">{item.quantity}</span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-right">
                <p className="font-semibold flex items-center justify-end">
                  <IndianRupee className="h-4 w-4" />
                  {(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground text-right">
                  <IndianRupee className="h-3 w-3 inline" />
                  {item.price.toLocaleString('en-IN')} × {item.quantity}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromCart(item.productId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
          
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              Clear Cart
            </Button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  <IndianRupee className="h-4 w-4 inline" />
                  {cart.total.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  <IndianRupee className="h-5 w-5 inline" />
                  {cart.total.toLocaleString('en-IN')}
                </span>
              </div>
              
              <Button 
                className="w-full mt-4 bg-primary hover:bg-primary/90" 
                onClick={handleCheckout}
                disabled={cart.items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Free shipping on all orders. Estimated delivery in 5-7 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;