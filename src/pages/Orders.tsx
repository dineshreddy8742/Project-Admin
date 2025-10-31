import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-utils';
import { 
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Eye
} from 'lucide-react';

interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'out-for-delivery' | 'delivered';
  orderDate: Date;
  deliveryDate?: Date;
  deliveryAddress: string;
  trackingNumber: string;
}

const Orders = () => {
  const { translateSync } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Mock orders data
  const [orders] = useState<Order[]>([
    {
      id: '1234567890',
      items: [
        { name: 'Fresh Tomatoes', quantity: 2, price: 45 },
        { name: 'Organic Onions', quantity: 1, price: 32 }
      ],
      totalAmount: 122,
      status: 'out-for-delivery',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveryAddress: 'HSR Layout, Bangalore, Karnataka',
      trackingNumber: 'TRK001234'
    },
    {
      id: '1234567891',
      items: [
        { name: 'Basmati Rice', quantity: 1, price: 85 },
        { name: 'Fresh Spinach', quantity: 1, price: 25 }
      ],
      totalAmount: 110,
      status: 'delivered',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deliveryAddress: 'Koramangala, Bangalore, Karnataka',
      trackingNumber: 'TRK001235'
    },
    {
      id: '1234567892',
      items: [
        { name: 'Fresh Mangoes', quantity: 1, price: 120 }
      ],
      totalAmount: 120,
      status: 'processing',
      orderDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      deliveryAddress: 'Whitefield, Bangalore, Karnataka',
      trackingNumber: 'TRK001236'
    }
  ]);

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

  const getStatusProgress = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 25;
      case 'shipped':
        return 50;
      case 'out-for-delivery':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
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

  const orderStatuses = [
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

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
            📦 {translateSync('My Orders')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync('Track your orders and delivery status')}
          </p>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-glow transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
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
                      <div className="text-xl font-bold text-primary">₹{order.totalAmount}</div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Items Ordered:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Tracking */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delivery Progress</span>
                      <span className="text-xs text-muted-foreground">
                        Tracking: {order.trackingNumber}
                      </span>
                    </div>
                    
                    <Progress 
                      value={getStatusProgress(order.status)} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between">
                      {orderStatuses.map((status, idx) => {
                        const IconComponent = status.icon;
                        const isActive = getStatusProgress(order.status) >= (idx + 1) * 25;
                        const isCurrent = order.status === status.key;
                        
                        return (
                          <motion.div 
                            key={status.key}
                            className={`flex flex-col items-center space-y-1 ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}
                            animate={{
                              scale: isCurrent ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: isCurrent ? Infinity : 0,
                              repeatDelay: 2
                            }}
                          >
                            <div className={`p-2 rounded-full ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <span className="text-xs text-center leading-tight">
                              {status.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
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

                  {/* Expanded Details */}
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
                          {order.deliveryDate && (
                            <div className="flex justify-between">
                              <span className="font-medium">Delivered On:</span>
                              <span className="text-success">{formatDate(order.deliveryDate)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="font-medium">Tracking Number:</span>
                            <span className="font-mono">{order.trackingNumber}</span>
                          </div>
                          <div>
                            <span className="font-medium">Delivery Address:</span>
                            <p className="text-muted-foreground mt-1">{order.deliveryAddress}</p>
                          </div>
                        </div>
                        
                        {order.status === 'delivered' && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Rate & Review
                            </Button>
                            <Button size="sm" variant="outline">
                              Reorder
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => window.history.back()}>
              Start Shopping
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;