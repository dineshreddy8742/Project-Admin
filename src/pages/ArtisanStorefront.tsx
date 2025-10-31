import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { ProjectArtisansSidebar } from '../components/ProjectArtisansSidebar';

interface Artisan {
  id: string;
  user_id: string;
  bio: string;
  specialization: string;
  experience: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  artisan_id: string; // Added based on relationship
  translations: any; // JSONB column for translations
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface CulturalStoryData {
  title: string;
  excerpt: string;
  fullContent: string;
  heritageTags: string[];
  images: { url: string; caption: string }[];
  timeline: { year: string; period: string; description: string }[];
}

import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/language-utils';



const ArtisanStorefront: React.FC = () => {

  const { artisanId } = useParams<{ artisanId: string }>();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [artisanData, setArtisanData] = useState<Artisan | null>(null);

  const [culturalStory, setCulturalStory] = useState<CulturalStoryData | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);

    const { toast } = useToast();

    const { currentLanguage } = useLanguage();

  

    const getTranslatedProduct = (product: Product, languageCode: string) => {

      if (product.translations && product.translations[languageCode]) {

        return {

          name: product.translations[languageCode].name || product.name,

          description: product.translations[languageCode].description || product.description,

        };

      }

      return {

        name: product.name,

        description: product.description,

      };

    };

  

      useEffect(() => {

  

        const fetchArtisanStorefrontData = async () => {

  

          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artisanId || '');

  

    

  

          if (!artisanId || !isUUID) {

  

            setLoading(false);

  

            return;

  

          }

  

        try {

          const { data: artisan, error: artisanError } = await supabase

            .from('artisans')

            .select('*')

            .eq('id', artisanId)

            .single();

  

          if (artisanError) throw artisanError;

          setArtisanData(artisan);

  

          // Fetch Products for this Artisan

          const { data: productsData, error: productsError } = await supabase

            .from('products')

            .select('*')

            .eq('artisan_id', artisanId);

  

          if (productsError) throw productsError;

          const adaptedProducts = productsData.map(p => ({

            ...p,

            name: getTranslatedProduct(p, currentLanguage.code).name,

            description: getTranslatedProduct(p, currentLanguage.code).description,

          }));

          setProducts(adaptedProducts);

  

          // Fetch Reviews for this Artisan's products

          const productIds = productsData.map(p => p.id);

          const { data: reviewsData, error: reviewsError } = await supabase

            .from('reviews')

            .select('*')

            .in('product_id', productIds);

  

          if (reviewsError) throw reviewsError;

          setReviews(reviewsData);

  

          // Fetch Cultural Story for this Artisan

          const { data: culturalStoryData, error: culturalStoryError } = await supabase

            .from('cultural_stories')

            .select('*')

            .eq('artisan_id', artisanId)

            .single();

  

          if (culturalStoryError) throw culturalStoryError;

          setCulturalStory(culturalStoryData);

        } catch (error) {

          console.error("Error fetching artisan storefront data:", error);

          toast({

            title: "Error fetching data",

            description: "Could not load the artisan storefront. Please try again later.",

            variant: "destructive",

          });

        } finally {

          setLoading(false);

        }

      };

  

      fetchArtisanStorefrontData();

    }, [artisanId, toast, currentLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <div className="flex">
          {isSidebarOpen && <ProjectArtisansSidebar onClose={() => setIsSidebarOpen(false)} />}
          <div className="flex-1 pt-20 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading artisan storefront...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex">
        {isSidebarOpen && <ProjectArtisansSidebar onClose={() => setIsSidebarOpen(false)} />}
        <main className="flex-1 pt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Artisan Profile Section */}
              {artisanData && <ArtisanProfile artisan={artisanData} />}

              {/* Cultural Story Section */}
              {culturalStory && <CulturalStory story={culturalStory} />}

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {products.length > 0 && <ProductGrid products={products} />}

                  {/* Customer Reviews */}
                  {reviews.length > 0 && (
                    <CustomerReviews
                      reviews={reviews}
                      averageRating={reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length}
                      totalReviews={reviews.length}
                    />
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    {artisanData && <ContactSection artisan={artisanData} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtisanStorefront;
