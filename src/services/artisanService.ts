import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { EnhancedProduct, ProductImage } from '@/hooks/useSupabase'; // Reusing product types
import { aiAssistantService } from './aiAssistantService'; // Assuming a similar AI service structure

// Global in-memory storage for mock products



export const artisanService = {
  /**
   * Generates marketing content (description, story, social media posts) for an artisan product.
   * @param imageUrl The URL of the product image.
   * @param productDetails Basic details about the product (name, category, materials).
   * @returns Generated marketing content.
   */
  generateMarketingContent: async (imageFile: File, productDetails: { name: string; category: string; materials: string; }): Promise<any> => {
    console.log('Generating marketing content for:', productDetails.name, 'from image:', imageFile.name);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('contentType', 'product'); // Assuming product description for now
    formData.append('customPrompt', `Generate a product description, a short story about its origin, and two social media posts for a product named ${productDetails.name}, which is a ${productDetails.category} made from ${productDetails.materials}.`)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';
    const response = await axios.post(`${API_URL}/api/artisan/generate-content`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Translates a given text into a target language.
   * @param text The text to translate.
   * @param targetLanguage The target language code (e.g., 'hi', 'bn').
   * @returns The translated text.
   */
  translateText: async (text: string, targetLanguage: string): Promise<string> => {
    console.log('Calling real backend for translation...');
    const API_URL = import.meta.env.VITE_API_URL || 'https://chintuvignu17-projectkisan.hf.space';
    
    try {
      // Use the backend to translate
      const response = await axios.post(`${API_URL}/api/translate`, { text, target_lang: targetLanguage });
      return response.data.translation;
    } catch (error) {
      console.warn('Backend translation failed, using fallback:', error);
      // Fallback: return original text if backend is not available
      return text;
    }
  },

  textToSpeech: async (text: string, languageCode: string): Promise<string> => {
    console.log('Calling real backend for text-to-speech...');
    const API_URL = import.meta.env.VITE_API_URL || 'https://chintuvignu17-projectkisan.hf.space';
    
    try {
      // Use the TTS endpoint we know exists - this matches what's in voiceService.ts
      const response = await axios.post(`${API_URL}/api/tts/speak`, { text, language: languageCode });
      return response.data.audio;
    } catch (error) {
      console.warn('Backend TTS failed, using fallback:', error);
      // Fallback: return empty string if backend is not available
      return '';
    }
  },

  createArtisanProduct: async (productData: Partial<EnhancedProduct>): Promise<EnhancedProduct> => {
    console.log('Creating artisan product:', productData);
    
    // Assuming artisan_id is available from a global context or passed in productData
    // For now, using a placeholder. In a real app, this would come from auth context.
    const artisanId = "some_artisan_id"; 

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        description: productData.description,
        condition: productData.condition,
        images: productData.images ? productData.images.map(img => img.url) : [], // Assuming images are stored as URLs
        artisan_id: artisanId, 
        ai_description: productData.aiDescription,
        ai_story: productData.aiStory,
        ai_social_media_posts: productData.aiSocialMediaPosts,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data as EnhancedProduct;
  },

  getArtisanProducts: async (): Promise<EnhancedProduct[]> => {
    console.log('Fetching artisan products from Supabase');
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching products:', productsError);
        // If Supabase fails, return mock data
        return this.getMockProducts();
      }

      if (!products || products.length === 0) {
        // Return mock data if no products found
        return this.getMockProducts();
      }

      const adaptedData = await Promise.all(products.map(async (product) => {
        const { data: artisan, error: artisanError } = await supabase
          .from('artisans')
          .select('name, location')
          .eq('id', product.artisan_id)
          .single();

        if (artisanError) {
          console.error(`Error fetching artisan for product ${product.id}:`, artisanError);
          // Continue without artisan data if not found
          return {
            ...product,
            seller: 'Unknown Artisan',
            location: 'Unknown Location',
            unit: 'piece',
            quantity: product.stock_quantity,
            freshness: 'N/A',
            isOrganic: false,
            likesCount: 0,
            savesCount: 0,
            feedback: [],
            postedAt: new Date(product.created_at),
          };
        }

        return {
          ...product,
          seller: artisan.name,
          location: artisan.location,
          unit: 'piece',
          quantity: product.stock_quantity,
          freshness: 'N/A',
          isOrganic: false,
          likesCount: 0,
          savesCount: 0,
          feedback: [],
          postedAt: new Date(product.created_at),
        };
      }));

      return adaptedData;
    } catch (error) {
      console.error('Error in getArtisanProducts:', error);
      // Return mock data if there's any error
      return this.getMockProducts();
    }
  },

  // Mock data function to provide more products when Supabase is unavailable
  getMockProducts: (): EnhancedProduct[] => {
    const mockProducts: EnhancedProduct[] = [
      {
        id: '1',
        name: 'Kanchipuram Silk Saree - Royal Blue',
        price: 12000,
        category: 'textiles',
        description: 'Authentic Kanchipuram silk saree with traditional zari work',
        condition: 'new',
        images: [''],
        artisan_id: '1',
        ai_description: 'The Kanchipuram Silk Saree represents the epitome of South Indian textile heritage. Woven with pure mulberry silk and intricate gold zari work, this royal blue masterpiece features traditional temple motifs and border designs passed down through generations of master weavers.',
        ai_story: 'In the ancient city of Kanchipuram, master weaver Smt. Meenakshi has spent four decades perfecting the art of silk weaving. Each saree takes 2-3 weeks to complete, with intricate patterns that tell stories of Tamil temple architecture and mythology.',
        ai_social_media_posts: [
          'Discover the timeless beauty of our Kanchipuram Silk Saree. Handwoven with passion and tradition. #KanchipuramSaree #Handloom #IndianHeritage',
          'Wear tradition with pride. Our royal blue Kanchipuram saree is perfect for weddings and celebrations. #TraditionalWeaves #SilkSaree'
        ],
        seller: 'Smt. Meenakshi',
        location: 'Tamil Nadu',
        unit: 'piece',
        quantity: 5,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
        stock_quantity: 5,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
      },
      {
        id: '2',
        name: 'Blue Pottery Handi',
        price: 2500,
        category: 'pottery',
        description: 'Handcrafted blue pottery handi with traditional Rajasthani designs',
        condition: 'new',
        images: [''],
        artisan_id: '2',
        ai_description: 'This exquisite blue pottery handi showcases the distinctive blue and white patterns of Jaipur. Crafted using a unique technique that originated from Persian influences, this piece features intricate geometric patterns and floral motifs that are characteristic of Rajasthani pottery.',
        ai_story: 'Sh. Rajesh Kumar, a third-generation blue pottery artisan from Jaipur, specializes in creating pieces that blend traditional Persian techniques with contemporary designs. Each piece is handcrafted without the use of a potter\'s wheel, making every item unique.',
        ai_social_media_posts: [
          'Add elegance to your kitchen with our handcrafted blue pottery handi. Functional and beautiful. #BluePottery #RajasthaniArt #Handmade',
          'Traditional Rajasthani blue pottery that brings heritage to your home. #Rajasthan #Pottery #Handcrafted'
        ],
        seller: 'Sh. Rajesh Kumar',
        location: 'Rajasthan',
        unit: 'piece',
        quantity: 8,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        stock_quantity: 8,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      },
      {
        id: '3',
        name: 'Warli Tribal Painting',
        price: 8500,
        category: 'painting',
        description: 'Traditional Warli tribal painting on canvas',
        condition: 'new',
        images: [''],
        artisan_id: '3',
        ai_description: 'This traditional Warli painting depicts the daily life and customs of the Warli tribe from Maharashtra. Created using simple geometric shapes and symbols, the artwork tells stories of farming, hunting, and community celebrations in the distinctive Warli style.',
        ai_story: 'Sh. Sanjay Pawar learned the art of Warli painting from his grandfather, a traditional tribal artist. He now creates contemporary interpretations of ancient Warli motifs, preserving this ancient art form for future generations while making it accessible to modern art collectors.',
        ai_social_media_posts: [
          'Experience the beauty of tribal art with our Warli painting collection. Each stroke tells a story of ancient traditions. #WarliArt #TribalArt #IndianPainting',
          'Celebrate India\'s rich tribal heritage with this authentic Warli painting. #WarliPainting #TribalHeritage #ArtisticExpression'
        ],
        seller: 'Sh. Sanjay Pawar',
        location: 'Maharashtra',
        unit: 'piece',
        quantity: 3,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        stock_quantity: 3,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      },
      {
        id: '4',
        name: 'Bidriware Pen Stand',
        price: 3200,
        category: 'metalwork',
        description: 'Intricate Bidriware pen stand with silver inlay work',
        condition: 'new',
        images: [''],
        artisan_id: '4',
        ai_description: 'This exquisite Bidriware pen stand exemplifies the sophisticated metalwork of Bidar, Karnataka. The blackened alloy is inlaid with intricate silver patterns, creating an elegant contrast that showcases the artisan\'s exceptional skill.',
        ai_story: 'Smt. Fatima Khan comes from a family of Bidri craftsmen who have practiced this art for over 500 years. The process of creating each piece involves casting, filing, inlaying, and oxidizing - a time-intensive process that results in these stunning black and silver artworks.',
        ai_social_media_posts: [
          'Elevate your workspace with our handcrafted Bidriware pen stand. Traditional craftsmanship meets modern utility. #Bidriware #Handcrafted #Workspace',
          'Experience the ancient art of Bidar with our exquisite pen stand. #Bidriware #Karnataka #TraditionalArt'
        ],
        seller: 'Smt. Fatima Khan',
        location: 'Karnataka',
        unit: 'piece',
        quantity: 2,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        stock_quantity: 2,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      },
      {
        id: '5',
        name: 'Madhubani Painting',
        price: 7200,
        category: 'painting',
        description: 'Vibrant Madhubani painting featuring nature motifs',
        condition: 'new',
        images: [''],
        artisan_id: '5',
        ai_description: 'This vibrant Madhubani painting from Bihar depicts nature motifs using traditional techniques. The artwork features intricate patterns and bright colors created from natural pigments, representing the rich folk art tradition of Mithila region.',
        ai_story: 'Smt. Shanti Devi is a master of Madhubani painting, an art form traditionally practiced by women in the Mithila region. Her paintings often feature themes of nature, fertility, and prosperity, using natural pigments made from flowers, leaves, and minerals.',
        ai_social_media_posts: [
          'Bring the vibrancy of Bihar to your home with our Madhubani painting collection. #MadhubaniArt #BiharArt #FolkArt',
          'Celebrate India\'s folk art traditions with this authentic Madhubani painting. #Madhubani #FolkPainting #IndianArt'
        ],
        seller: 'Smt. Shanti Devi',
        location: 'Bihar',
        unit: 'piece',
        quantity: 4,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        stock_quantity: 4,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        id: '6',
        name: 'Channapatna Wooden Toys',
        price: 1500,
        category: 'toys',
        description: 'Colorful wooden toys painted with vegetable dyes',
        condition: 'new',
        images: [''],
        artisan_id: '6',
        ai_description: 'These colorful wooden toys from Channapatna are painted with natural vegetable dyes, making them safe for children. The toys showcase traditional designs and are crafted using techniques passed down through generations of Karnataka artisans.',
        ai_story: 'Sh. Ravi Gowda belongs to a community of toy makers in Channapatna, known as the "toys city" of Karnataka. His family has been creating these eco-friendly toys for over 100 years, using wood from the local neem trees and natural dyes from vegetables and flowers.',
        ai_social_media_posts: [
          'Safe, eco-friendly toys for your children, handcrafted with love. #ChannapatnaToys #Toys #EcoFriendly',
          'Introduce your children to traditional Indian toys, painted with natural dyes. #TraditionalToys #EcoFriendly #Handcrafted'
        ],
        seller: 'Sh. Ravi Gowda',
        location: 'Karnataka',
        unit: 'piece',
        quantity: 12,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
        stock_quantity: 12,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
      },
      {
        id: '7',
        name: 'Banarasi Silk Saree - Golden Brocade',
        price: 15000,
        category: 'textiles',
        description: 'Luxurious Banarasi silk saree with intricate golden brocade work',
        condition: 'new',
        images: [''],
        artisan_id: '7',
        ai_description: 'This luxurious Banarasi silk saree features intricate golden brocade work (zari) that has been the hallmark of Varanasi weavers for centuries. The saree\'s rich fabric and elaborate designs make it perfect for weddings and special occasions.',
        ai_story: 'Smt. Kavita Devi represents the fifth generation of Banarasi weavers in Varanasi. Each saree takes 15-30 days to complete and requires the expertise of multiple artisans working together to create these masterpieces.',
        ai_social_media_posts: [
          'Experience the luxury of Banarasi silk with this golden brocade masterpiece. #BanarasiSaree #LuxurySilk #WeddingWear',
          'A symbol of elegance and tradition - our Banarasi silk collection. #BanarasiSilk #TraditionalWeaves #IndianHeritage'
        ],
        seller: 'Smt. Kavita Devi',
        location: 'Uttar Pradesh',
        unit: 'piece',
        quantity: 6,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        stock_quantity: 6,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
      },
      {
        id: '8',
        name: 'Tanjore Painting - Lord Ganesha',
        price: 9800,
        category: 'painting',
        description: 'Traditional Tanjore painting of Lord Ganesha with gold foil and gemstones',
        condition: 'new',
        images: [''],
        artisan_id: '8',
        ai_description: 'This traditional Tanjore painting of Lord Ganesha features gold foil and semi-precious stones. The art form originated in Thanjavur, Tamil Nadu, and is known for its rich colors, gold leaf work, and embedded gems.',
        ai_story: 'Sh. Subramanian specializes in the ancient art of Tanjore painting, a technique that requires multiple stages including base preparation, drawing, gesso work, gold leaf application, and gemstone inlay. Each painting takes 2-4 weeks to complete.',
        ai_social_media_posts: [
          'Bless your home with our divine Tanjore painting of Lord Ganesha. #TanjoreArt #ReligiousArt #Ganesha',
          'Experience the grandeur of Tanjore painting with gold leaf and gems. #TanjorePainting #TraditionalArt #ArtisticHeritage'
        ],
        seller: 'Sh. Subramanian',
        location: 'Tamil Nadu',
        unit: 'piece',
        quantity: 3,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
        stock_quantity: 3,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
      },
      {
        id: '9',
        name: 'Kantha Embroidery Saree',
        price: 6500,
        category: 'textiles',
        description: 'Hand-embroidered Kantha saree from West Bengal',
        condition: 'new',
        images: [''],
        artisan_id: '9',
        ai_description: 'This beautiful Kantha saree from West Bengal features intricate running stitch embroidery that creates beautiful motifs and patterns. Kantha was traditionally used to stitch old saris together and is now a popular textile art form.',
        ai_story: 'Smt. Sunita Das learned the art of Kantha embroidery from her grandmother. Each saree tells a story through its patterns, often depicting scenes from daily life, nature, and folklore. The running stitch technique requires patience and skill.',
        ai_social_media_posts: [
          'The beauty of Kantha embroidery in our handcrafted sarees. #KanthaSaree #BengaliArt #HandEmbroidery',
          'Traditional Kantha work that brings stories to life on fabric. #KanthaArt #BengaliHeritage #EmbroideredSarees'
        ],
        seller: 'Smt. Sunita Das',
        location: 'West Bengal',
        unit: 'piece',
        quantity: 7,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
        stock_quantity: 7,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
      },
      {
        id: '10',
        name: 'Terracotta Diyas Set',
        price: 800,
        category: 'pottery',
        description: 'Set of 12 handcrafted terracotta diyas for festivals',
        condition: 'new',
        images: [''],
        artisan_id: '10',
        ai_description: 'These beautiful terracotta diyas are perfect for festivals, especially Diwali. Each diya is handcrafted from natural clay and finished with traditional techniques that have been passed down through generations.',
        ai_story: 'Sh. Govind Sharma creates terracotta diyas using traditional techniques from his village in Uttar Pradesh. Each diya is shaped by hand, dried naturally, and finished with care. During Diwali, demand for his diyas increases significantly as people appreciate the authentic, handmade quality.',
        ai_social_media_posts: [
          'Brighten your Diwali with our handcrafted terracotta diyas. #TerracottaDiyas #Diwali #Festival',
          'Traditional terracotta diyas that bring warmth and light to your home. #Diyas #TraditionalCrafts #Handmade'
        ],
        seller: 'Sh. Govind Sharma',
        location: 'Uttar Pradesh',
        unit: 'set',
        quantity: 25,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        stock_quantity: 25,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
      },
      {
        id: '11',
        name: 'Pashmina Shawl - Traditional Kashmiri',
        price: 8000,
        category: 'textiles',
        description: 'Handwoven Pashmina shawl with traditional Kashmiri embroidery',
        condition: 'new',
        images: [''],
        artisan_id: '11',
        ai_description: 'This exquisite Pashmina shawl is crafted from the finest cashmere wool from Kashmir. Each shawl takes 2-3 weeks to hand-weave, featuring traditional Sozni embroidery patterns that have been passed down through generations of Kashmiri artisans.',
        ai_story: 'Sh. Abdul Rashid, a master Pashmina weaver from Srinagar, has been perfecting his craft since childhood. His family has been in the Pashmina business for over 100 years, preserving the traditional techniques and patterns that make these shawls so special.',
        ai_social_media_posts: [
          'Experience the luxury of authentic Kashmiri Pashmina. #Pashmina #KashmiriShawl #Luxury',
          'Traditional craftsmanship in every thread. Our Pashmina collection. #PashminaShawl #Kashmir #Handwoven'
        ],
        seller: 'Sh. Abdul Rashid',
        location: 'Jammu and Kashmir',
        unit: 'piece',
        quantity: 9,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
        stock_quantity: 9,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
      },
      {
        id: '12',
        name: 'Dhokra Metal Craft - Horse Statue',
        price: 2800,
        category: 'metalwork',
        description: 'Traditional Dhokra metal craft horse statue from Chhattisgarh',
        condition: 'new',
        images: [''],
        artisan_id: '12',
        ai_description: 'This beautiful Dhokra horse statue represents one of India\'s oldest metal casting techniques, dating back over 4000 years. Made using the lost-wax casting method, each piece is unique and showcases the intricate artistry of tribal craftspeople.',
        ai_story: 'Sh. Lakhan Ram belongs to the Dhokra tribal community in Chhattisgarh, known for their ancient metal craft tradition. Each Dhokra piece takes 1-2 weeks to complete, involving multiple stages of wax modeling, clay casting, and final finishing.',
        ai_social_media_posts: [
          'The ancient art of Dhokra metal craft. Each piece tells a story. #DhokraArt #TribalCraft #MetalWork',
          '4000 years of tradition in our Dhokra metal craft collection. #Dhokra #TraditionalArt #Handmade'
        ],
        seller: 'Sh. Lakhan Ram',
        location: 'Chhattisgarh',
        unit: 'piece',
        quantity: 4,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // 9 days ago
        stock_quantity: 4,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString()
      },
      {
        id: '13',
        name: 'Phulkari Dupatta - Traditional',
        price: 4500,
        category: 'textiles',
        description: 'Hand-embroidered Phulkari dupatta from Punjab',
        condition: 'new',
        images: [''],
        artisan_id: '13',
        ai_description: 'This vibrant Phulkari dupatta features traditional floral motifs created using the ancient art of Phulkari embroidery from Punjab. The name literally means "flower work" and represents the rich textile heritage of North India.',
        ai_story: 'Smt. Harpreet Kaur learned the art of Phulkari from her grandmother, who would embroider these beautiful pieces for wedding trousseaus. Each dupatta takes 3-4 weeks to complete, with intricate patterns that can include up to 20 different stitches.',
        ai_social_media_posts: [
          'The vibrant beauty of Punjab in our Phulkari collection. #Phulkari #PunjabiArt #Embroidery',
          'Traditional Phulkari dupattas that celebrate Punjabi heritage. #PunjabiCraft #TraditionalWear #HandEmbroidery'
        ],
        seller: 'Smt. Harpreet Kaur',
        location: 'Punjab',
        unit: 'piece',
        quantity: 5,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11), // 11 days ago
        stock_quantity: 5,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString()
      },
      {
        id: '14',
        name: 'Mysore Sandalwood Carving',
        price: 5500,
        category: 'woodwork',
        description: 'Intricate Mysore sandalwood carving with traditional motifs',
        condition: 'new',
        images: [''],
        artisan_id: '14',
        ai_description: 'This exquisite sandalwood carving showcases the traditional craftsmanship of Mysore artisans. The soft, fragrant sandalwood is carefully hand-carved with intricate patterns and motifs, representing Karnataka\'s rich woodwork heritage.',
        ai_story: 'Sh. Venkatesh is a fourth-generation sandalwood carver from Mysore, known for creating intricate religious and decorative items. The sandalwood\'s natural fragrance and durability make it ideal for detailed carvings that last for generations.',
        ai_social_media_posts: [
          'The elegance of Mysore sandalwood craftsmanship. #SandalwoodArt #MysoreArt #WoodCarving',
          'Experience the traditional art of sandalwood carving from Mysore. #MysoreCraft #Sandalwood #Handcrafted'
        ],
        seller: 'Sh. Venkatesh',
        location: 'Karnataka',
        unit: 'piece',
        quantity: 6,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13), // 13 days ago
        stock_quantity: 6,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString()
      },
      {
        id: '15',
        name: 'Apatani Tribal Jewelry',
        price: 3200,
        category: 'jewelry',
        description: 'Traditional Apatani tribal jewelry from Arunachal Pradesh',
        condition: 'new',
        images: [''],
        artisan_id: '15',
        ai_description: 'These traditional Apatani jewelry pieces represent the cultural heritage of the Apatani tribe from Arunachal Pradesh. Made using traditional techniques and materials, these pieces often incorporate bamboo, seeds, and locally sourced metals.',
        ai_story: 'Smt. Ladi Tasser is an artisan from the Apatani tribe, known for their unique jewelry traditions. Each piece of jewelry tells a story and often indicates the wearer\'s social status, marital condition, and tribal identity within the community.',
        ai_social_media_posts: [
          'The unique beauty of Apatani tribal jewelry. #ApataniJewelry #TribalHeritage #Traditional',
          'Authentic tribal jewelry from Arunachal Pradesh. #TribalJewelry #NorthEastIndia #Handcrafted'
        ],
        seller: 'Smt. Ladi Tasser',
        location: 'Arunachal Pradesh',
        unit: 'set',
        quantity: 8,
        freshness: 'N/A',
        isOrganic: false,
        likesCount: 0,
        savesCount: 0,
        feedback: [],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        stock_quantity: 8,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      }
    ];

    return mockProducts;
  },

  updateArtisanProduct: async (productId: string, productData: Partial<EnhancedProduct>): Promise<EnhancedProduct> => {
    console.log('Updating artisan product:', productId, productData);
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        description: productData.description,
        condition: productData.condition,
        images: productData.images ? productData.images.map(img => img.url) : [],
        ai_description: productData.aiDescription,
        ai_story: productData.aiStory,
        ai_social_media_posts: productData.aiSocialMediaPosts,
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data as EnhancedProduct;
  },

  deleteArtisanProduct: async (productId: string): Promise<boolean> => {
    console.log('Deleting artisan product:', productId);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return true;
  },

  /**
   * Fetch an artisan's profile by userId.
   * @param userId The artisan's unique id
   */
  getArtisanProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('artisans')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update an artisan's profile.
   * @param userId The artisan's unique id
   * @param profileData The new profile fields
   */
  updateArtisanProfile: async (userId: string, profileData: Record<string, any>) => {
    const { data, error } = await supabase
      .from('artisans')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
