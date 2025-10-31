import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColdStorageForm } from "@/components/ColdStorageForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import eventBus from "@/lib/eventBus";
import { 
  Snowflake, 
  Thermometer, 
  Apple, 
  Carrot, 
  DollarSign,
  Clock,
  TrendingUp,
  Warehouse,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  Star
} from "lucide-react";

const ColdStorage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const { translate, translateSync, currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const handleOpenForm = () => setIsFormOpen(true);
    const handleClickElement = ({ target }: { target: string }) => {
      if (target === 'Register for Storage') {
        setIsFormOpen(true);
      }
    };

    eventBus.on('open-cold-storage-form', handleOpenForm);
    eventBus.on('click-element', handleClickElement);

    return () => {
      eventBus.remove('open-cold-storage-form', handleOpenForm);
      eventBus.remove('click-element', handleClickElement);
    };
  }, []);

  // Translate static texts when language changes
  useEffect(() => {
    const translateStaticTexts = async () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      const textsToTranslate = [
        'Cold Storage Access',
        'Preserve Freshness. Reduce Waste. Increase Profits.',
        'What is Cold Storage?',
        'Why Farmers Need Cold Storage',
        'Types of Cold Storage Available',
        'How to Get Access',
        'Government Support & Schemes',
        'Register for Cold Storage',
        'Longer Shelf Life',
        'Better Market Prices',
        'Reduce Post-Harvest Loss',
        'Direct Supply to Markets'
      ];

      const translated: Record<string, string> = {};
      
      for (const text of textsToTranslate) {
        try {
          translated[text] = await translate(text);
        } catch (error) {
          translated[text] = text;
        }
      }
      
      setTranslatedTexts(translated);
    };

    translateStaticTexts();
  }, [currentLanguage, translate]);

  const t = (text: string) => translatedTexts[text] || text;

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  };

  const benefits = [
    {
      id: "longer-shelf-life",
      icon: Clock,
      title: "Longer Shelf Life",
      description: "Store produce for weeks without damage",
      color: "text-blue-600"
    },
    {
      id: "better-prices",
      icon: DollarSign,
      title: "Better Market Prices",
      description: "Sell when rates are high, not immediately",
      color: "text-green-600"
    },
    {
      id: "reduce-loss",
      icon: TrendingUp,
      title: "Reduce Post-Harvest Loss",
      description: "Prevent 30–40% crop wastage",
      color: "text-purple-600"
    },
    {
      id: "direct-supply",
      icon: Warehouse,
      title: "Direct Supply to Markets",
      description: "Fulfill bulk orders from cities, shops",
      color: "text-orange-600"
    }
  ];

  const storageTypes = [
    {
      id: "mini-cold-rooms",
      type: "Mini Cold Rooms",
      details: "For small-scale farmers, solar-powered options",
      icon: Snowflake
    },
    {
      id: "controlled-atmosphere",
      type: "Controlled Atmosphere",
      details: "Advanced control of humidity, gases, and temperature",
      icon: Thermometer
    },
    {
      id: "ripening-chambers",
      type: "Ripening Chambers",
      details: "Ideal for mangoes, bananas, and other climacteric fruits",
      icon: Apple
    }
  ];

  const supportSchemes = [
    "NHB Subsidy (up to 50% for cold storage setup)",
    "PM Kisan Sampada Yojana",
    "State-level storage rent support"
  ];

  const steps = [
    "Register your farm and produce type",
    "Get assigned to a nearby cold storage facility", 
    "Pay only for the time and space you use",
    "Track your stored items with SMS alerts and digital receipts"
  ];

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
      toast({
        title: "Removed from favorites",
        description: "Item removed from your favorites list",
      });
    } else {
      newFavorites.add(itemId);
      toast({
        title: "Added to favorites",
        description: "Item added to your favorites list",
      });
    }
    setFavorites(newFavorites);
  };

  const submitFeedback = () => {
    if (feedback.rating === 0) {
      toast({
        title: "Please provide a rating",
        description: "Rating is required to submit feedback",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Feedback submitted!",
      description: "Thank you for your valuable feedback",
    });
    setShowFeedback(false);
    setFeedback({ rating: 0, comment: "" });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Header Section */}
        <motion.div 
          className="text-center py-8 md:py-16 px-4"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Snowflake className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-800 text-center">
              {t('Cold Storage Access')}
            </h1>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-2">
            🧺 {t('Preserve Freshness. Reduce Waste. Increase Profits.')}
          </p>
          <p className="text-sm md:text-lg text-gray-600 max-w-4xl mx-auto">
            With modern cold storage facilities, farmers can now store their vegetables, fruits, and perishables safely for extended periods. This ensures better prices, less spoilage, and year-round market availability.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-16 space-y-8 md:space-y-12">
          {/* Favorites and Feedback Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Button
              
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Warehouse className="h-4 w-4" />
              Register for Storage
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4" />
              Give Feedback
            </Button>
          </motion.div>

          {/* What is Cold Storage */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-xl rounded-2xl p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-green-600 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">🟢</span> {t('What is Cold Storage?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  Cold storage is a temperature-controlled facility used to store perishable produce like:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Carrot className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">🥦 Vegetables (tomatoes, potatoes, onions)</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Apple className="h-5 w-5 md:h-6 md:w-6 text-red-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">🍎 Fruits (mangoes, bananas, grapes)</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <span className="text-xl md:text-2xl flex-shrink-0">🌶️</span>
                    <span className="text-sm md:text-base">Chillies, herbs, leafy greens</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 text-sm md:text-base">
                  It maintains freshness, prevents rot, and allows selling at the right time for better income.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Why Farmers Need Cold Storage */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white shadow-xl rounded-2xl p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-yellow-600 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">🟡</span> Why Farmers Need Cold Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(benefit.id)}
                        className="absolute top-2 right-2 p-1 h-auto"
                      >
                        <Heart 
                          className={`h-4 w-4 ${favorites.has(benefit.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                        />
                      </Button>
                      <benefit.icon className={`h-6 w-6 md:h-8 md:w-8 ${benefit.color} flex-shrink-0`} />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Types of Cold Storage */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white shadow-xl rounded-2xl p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-purple-600 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">🟣</span> Types of Cold Storage Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {storageTypes.map((storage, index) => (
                    <motion.div
                      key={storage.id}
                      className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 relative"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      
                      <storage.icon className="h-8 w-8 md:h-12 md:w-12 text-blue-600 mb-4" />
                      <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">{storage.type}</h3>
                      <p className="text-gray-600 text-sm">{storage.details}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How to Get Access */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white shadow-xl rounded-2xl p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
                  <Snowflake className="h-6 w-6 md:h-8 md:w-8" /> How to Get Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <Badge variant="default" className="min-w-fit text-xs md:text-sm">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 text-sm md:text-base">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="text-center w-full"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 text-sm md:text-lg w-full lg:w-auto"
                        onClick={() => setIsFormOpen(true)}
                      >
                        {t('Register for Cold Storage')}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Government Support */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-white shadow-xl rounded-2xl p-4 md:p-6">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-green-600 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">💼</span> Government Support & Schemes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {supportSchemes.map((scheme, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">{scheme}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-700 text-sm md:text-base">
                    <strong>Contact Information:</strong> Reach out to your Agricultural Officer or nearby FPO to register for cold storage access.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <span className="text-xs md:text-sm text-gray-600">Helpline Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <span className="text-xs md:text-sm text-gray-600">Local Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      <span className="text-xs md:text-sm text-gray-600">24/7 Service</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-4">Share Your Feedback</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className="text-2xl"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                  placeholder="Share your thoughts about our cold storage services..."
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={submitFeedback} className="flex-1">
                  Submit Feedback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cold Storage Registration Form */}
        <ColdStorageForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />
      </div>
    </Layout>
  );
};

export default ColdStorage;