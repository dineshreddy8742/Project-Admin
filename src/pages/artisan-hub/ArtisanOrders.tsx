import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ArtisanOrders = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const mockOrders = [
    {
      id: 'ORD001',
      customer: 'Ravi Kumar',
      date: '2023-10-28',
      total: 2500,
      status: 'Processing',
      items: [
        { name: 'Hand-painted Vase', quantity: 1 },
        { name: 'Terracotta Pot', quantity: 2 },
      ],
    },
    {
      id: 'ORD002',
      customer: 'Priya Sharma',
      date: '2023-10-27',
      total: 1800,
      status: 'Shipped',
      items: [
        { name: 'Wooden Elephant Statue', quantity: 1 },
      ],
    },
    {
      id: 'ORD003',
      customer: 'Amit Singh',
      date: '2023-10-25',
      total: 3200,
      status: 'Delivered',
      items: [
        { name: 'Brass Diya Set', quantity: 2 },
        { name: 'Silk Scarf', quantity: 1 },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Shipped':
        return <Badge variant="outline">{status}</Badge>;
      case 'Delivered':
        return <Badge>{status}</Badge>;
      default:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  const handleManageOrder = (orderId: string) => {
    toast({
      title: "Manage Order",
      description: `Managing order ${orderId}`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-section-title text-primary font-indian">{t("My Orders")}</h1>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">{t("All Orders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {mockOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>₹{order.total.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleManageOrder(order.id)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("You have no orders yet.")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArtisanOrders;
