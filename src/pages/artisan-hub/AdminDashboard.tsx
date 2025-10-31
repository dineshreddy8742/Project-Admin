import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();

  const mockArtisans = [
    {
      id: 'ART001',
      name: 'Lakshmi Devi',
      craft: 'Pottery',
      location: 'Jaipur, Rajasthan',
      status: 'Pending',
    },
    {
      id: 'ART002',
      name: 'Rajesh Kumar',
      craft: 'Wood carving',
      location: 'Srinagar, Jammu & Kashmir',
      status: 'Pending',
    },
    {
      id: 'ART003',
      name: 'Meena Kumari',
      craft: 'Weaving',
      location: 'Varanasi, Uttar Pradesh',
      status: 'Approved',
    },
  ];

  const handleApprove = (artisanId: string) => {
    toast({
      title: "Artisan Approved",
      description: `Artisan ${artisanId} has been approved.`,
    });
  };

  const handleReject = (artisanId: string) => {
    toast({
      title: "Artisan Rejected",
      description: `Artisan ${artisanId} has been rejected.`,
      variant: "destructive",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-section-title text-primary font-indian">{translateSync("Admin Dashboard")}</h1>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">{translateSync("Artisan Approvals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Craft</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockArtisans.map((artisan) => (
                <TableRow key={artisan.id}>
                  <TableCell>{artisan.id}</TableCell>
                  <TableCell>{artisan.name}</TableCell>
                  <TableCell>{artisan.craft}</TableCell>
                  <TableCell>{artisan.location}</TableCell>
                  <TableCell>{artisan.status}</TableCell>
                  <TableCell>
                    {artisan.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleApprove(artisan.id)}>
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(artisan.id)}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;
