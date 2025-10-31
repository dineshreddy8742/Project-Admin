import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Package } from 'lucide-react';
import { artisanService } from '@/services/artisanService';

interface Artifact {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  condition: string;
}

const ArtisanProducts = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);

  useEffect(() => {
    const fetchArtifacts = async () => {
      setIsLoadingArtifacts(true);
      try {
        const fetchedArtifacts = await artisanService.getArtisanProducts();
        setArtifacts(fetchedArtifacts.filter(artifact => artifact.seller === 'Your Shop'));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: languageT("Error"),
          description: languageT("Failed to load your products."),
          variant: "destructive",
        });
      } finally {
        setIsLoadingArtifacts(false);
      }
    };
    fetchArtifacts();
  }, [toast, languageT]);

  const handleDeleteArtifact = async (artifactId: string) => {
    if (!confirm(languageT("Are you sure you want to delete this product?"))) {
      return;
    }
    try {
      await artisanService.deleteArtisanProduct(artifactId);
      setArtifacts(prev => prev.filter(artifact => artifact.id !== artifactId));
      toast({
        title: languageT("Product Deleted"),
        description: languageT("The product has been successfully deleted."),
      });
    } catch (error) {
      console.error("Error deleting artifact:", error);
      toast({
        title: languageT("Deletion Failed"),
        description: languageT("Could not delete product. Please try again."),
        variant: "destructive"
      });
    }
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-section-title text-primary font-indian">{languageT("My Products")}</h1>
        <Link to="/artisans/add-product">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            {languageT("Add New Product")}
          </Button>
        </Link>
      </div>

      {isLoadingArtifacts ? (
        <div className="text-center py-8">
          <p>{languageT("Loading your products...")}</p>
        </div>
      ) : artifacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {artifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="hover:shadow-glow transition-all bg-card">
                  <CardHeader className="text-center pb-2">
                    <div className="text-6xl mb-2">
                      {artifact.images && artifact.images.length > 0 ? (
                        <img src={artifact.images[0]} alt={artifact.name} className="w-full h-32 object-cover rounded-md" />
                      ) : (
                        '📦'
                      )}
                    </div>
                    <CardTitle className="text-lg font-indian text-primary">{artifact.name}</CardTitle>
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
                    <div className="flex justify-end gap-2">
                      <Link to={`/artisans/add-product?id=${artifact.id}`}>
                        <Button variant="outline" size="sm">
                          {languageT("Edit")}
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteArtifact(artifact.id)}>
                        {languageT("Delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{languageT("No products found")}</h3>
          <p className="text-muted-foreground mb-4">
            {languageT("Get started by adding your first product.")}
          </p>
          <Link to="/artisans/add-product">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              {languageT("Add Your First Product")}
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default ArtisanProducts;
