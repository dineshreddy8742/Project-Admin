import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-utils';
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  Lightbulb,
  Users,
  Shield,
  Zap
} from 'lucide-react';

const Help: React.FC = () => {
  const { translate, translateSync, currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const translateStaticTexts = async () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      const textsToTranslate = [
        'Help & Support',
        'How can we help you today?',
        'Search for help',
        'Frequently Asked Questions',
        'Quick Start Guide',
        'Contact Support',
        'Community Forum',
        'How do I start monitoring my crops?',
        'What are the system requirements?',
        'How accurate is the disease detection?',
        'Can I use the app offline?',
        'How do I access government schemes?',
        'What payment methods are accepted?',
        'How do I change my profile information?',
        'Can I export my crop data?',
        'Getting Started',
        'Features',
        'Account',
        'Technical',
        'Phone Support',
        'Email Support',
        'Visit Office',
        'Mon-Fri 9AM-6PM',
        'Available in Hindi, English, Kannada',
        'Bangalore, Karnataka'
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

  const t = (text: string) => translatedTexts[text] || translateSync(text) || text;

  const faqs = [
    {
      category: t('Getting Started'),
      icon: <Lightbulb className="h-5 w-5" />,
      questions: [
        {
          question: t('How do I start monitoring my crops?'),
          answer: 'Navigate to Crop Monitor, select your field location on the map, and choose the crop type. The system will automatically start tracking weather, soil conditions, and growth patterns.'
        },
        {
          question: t('What are the system requirements?'),
          answer: 'Project Kisan works on any device with internet connection - smartphones, tablets, or computers. We recommend using the latest version of Chrome, Firefox, or Safari browsers.'
        }
      ]
    },
    {
      category: t('Features'),
      icon: <Zap className="h-5 w-5" />,
      questions: [
        {
          question: t('How accurate is the disease detection?'),
          answer: 'Our AI disease detection system has 94% accuracy rate, trained on over 100,000 crop images. For best results, take clear photos in good lighting and follow the upload guidelines.'
        },
        {
          question: t('Can I use the app offline?'),
          answer: 'Basic features like viewing saved crop data work offline. However, real-time weather updates, disease detection, and market prices require internet connection.'
        }
      ]
    },
    {
      category: t('Account'),
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          question: t('How do I access government schemes?'),
          answer: 'Go to Government Schemes section, filter by your location and crop type. Click on any scheme to view eligibility criteria and application process.'
        },
        {
          question: t('How do I change my profile information?'),
          answer: 'Click on your profile picture in the top-right corner, select Settings, then Update Profile. You can change your name, location, farm details, and contact information.'
        }
      ]
    },
    {
      category: t('Technical'),
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: t('What payment methods are accepted?'),
          answer: 'We accept UPI, debit/credit cards, net banking, and digital wallets. All transactions are secured with 256-bit SSL encryption.'
        },
        {
          question: t('Can I export my crop data?'),
          answer: 'Yes! Go to Settings > Data Export to download your crop monitoring data, weather history, and market analysis in PDF or Excel format.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        searchQuery === '' ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <HelpCircle className="h-12 w-12 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-hero text-primary font-indian mb-4">
            {t('Help & Support')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('How can we help you today?')}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('Search for help')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="text-center hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
                className="inline-block mb-4"
              >
                <BookOpen className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{t('Quick Start Guide')}</h3>
              <p className="text-sm text-muted-foreground">
                Learn the basics and get started quickly
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                transition={{ duration: 0.3 }}
                className="inline-block mb-4"
              >
                <MessageCircle className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{t('Contact Support')}</h3>
              <p className="text-sm text-muted-foreground">
                Get help from our expert team
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.3 }}
                className="inline-block mb-4"
              >
                <Users className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{t('Community Forum')}</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other farmers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-section-title text-primary font-indian">
                ❓ {t('Frequently Asked Questions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-3">
                      {category.icon}
                      {category.category}
                    </div>
                    {category.questions.map((faq, index) => (
                      <AccordionItem 
                        key={`${categoryIndex}-${index}`}
                        value={`${categoryIndex}-${index}`}
                        className="border border-border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {t(faq.answer)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('Phone Support')}</h3>
              <p className="text-sm text-muted-foreground mb-2">+91 80-4567-8900</p>
              <p className="text-xs text-muted-foreground">{t('Mon-Fri 9AM-6PM')}</p>
              <p className="text-xs text-muted-foreground">{t('Available in Hindi, English, Kannada')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('Email Support')}</h3>
              <p className="text-sm text-muted-foreground mb-2">support@projectkisan.com</p>
              <p className="text-xs text-muted-foreground">Response within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('Visit Office')}</h3>
              <p className="text-sm text-muted-foreground mb-2">{t('Bangalore, Karnataka')}</p>
              <p className="text-xs text-muted-foreground">Koramangala, Sector 4</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Help;