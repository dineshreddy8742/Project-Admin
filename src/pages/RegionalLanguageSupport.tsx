import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, languages } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Languages, Globe, Volume2, Download } from 'lucide-react';
import { apiService } from '@/services/apiService';

const RegionalLanguageSupport = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);

  // Indian regional languages
  const indianLanguages = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  ];

  // Function to get Indian language by code
  const getIndianLanguageByCode = (code: string) => {
    return indianLanguages.find(lang => lang.code === code) || indianLanguages[0];
  };

  useEffect(() => {
    // Filter languages to show only Indian regional ones
    const indianLangs = languages.filter(lang => 
      indianLanguages.some(indianLang => indianLang.code === lang.code)
    );
    setSupportedLanguages(indianLangs);
  }, [languages]);

  const translateText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      // API call to translation service
      const response = await apiService.translateText(inputText, targetLanguage);
      setTranslatedText(response);
      
      toast({
        title: "Translation Complete",
        description: "Text has been successfully translated."
      });
    } catch (error) {
      console.error("Translation failed:", error);
      // Fallback translation for demo
      setTranslatedText(`Translated text in ${getIndianLanguageByCode(targetLanguage).nativeName}: ${inputText}`);
      toast({
        title: "Translation Complete (Demo)",
        description: "This is a demo translation. The actual service will be connected when backend is available."
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = async () => {
    if (!translatedText) {
      toast({
        title: "No Text",
        description: "Please translate text first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // API call to text-to-speech service
      const response = await apiService.textToSpeech(translatedText, targetLanguage);
      if (response) {
        // Create a blob from the audio response and play it
        const audioBlob = new Blob([response], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        
        toast({
          title: "Text-to-Speech",
          description: `Playing audio in ${getIndianLanguageByCode(targetLanguage).nativeName}`
        });
      }
      if (audio) {
        // In a real implementation, we would play the audio
        toast({
          title: "Text-to-Speech",
          description: `Playing audio in ${getIndianLanguageByCode(targetLanguage).nativeName}`
        });
      } else {
        // Fallback for demo
        toast({
          title: "Text-to-Speech",
          description: `Audio would play in ${getIndianLanguageByCode(targetLanguage).nativeName} (demo mode)`
        });
      }
    } catch (error) {
      console.error("TTS failed:", error);
      toast({
        title: "TTS Failed",
        description: "Could not generate speech. Please try again."
      });
    }
  };

  const downloadText = () => {
    if (!translatedText) {
      toast({
        title: "No Text",
        description: "Please translate text first.",
        variant: "destructive"
      });
      return;
    }

    // Create a blob and download link
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_text_${targetLanguage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Translated text downloaded successfully."
    });
  };

  const quickTranslate = (phrase: string) => {
    setInputText(phrase);
    // Auto-translate after setting input
    setTimeout(() => {
      translateText();
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full mr-4">
            <Languages className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Regional Language Support
            </h1>
            <p className="text-lg text-muted-foreground">
              Translate your artisan stories and product descriptions to Indian regional languages
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Translate Text
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Input Text</label>
              <Textarea
                placeholder="Enter your product description, heritage story, or marketing text in English..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-background min-h-[150px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Language</label>
              <Select 
                value={targetLanguage} 
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {indianLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name} ({lang.nativeName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={translateText}
                disabled={isTranslating}
                className="bg-primary hover:bg-primary/90 flex-1 min-w-[120px]"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Quick Translation Phrases</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quickTranslate("Handcrafted with traditional techniques passed down through generations")}
                >
                  Heritage Craft
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quickTranslate("Made with eco-friendly materials")}
                >
                  Eco-Friendly
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quickTranslate("Supporting local artisans and preserving traditional crafts")}
                >
                  Support Local
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quickTranslate("Authentic traditional craft from Tamil Nadu")}
                >
                  Regional Pride
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Translation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto p-4 bg-background rounded-md border">
              {translatedText ? (
                <div className="prose max-w-none">
                  <p className="text-justify">{translatedText}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Translated text will appear here...</p>
                </div>
              )}
            </div>

            {translatedText && (
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={speakText}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadText}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Indian Languages Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {indianLanguages.map((lang) => (
              <div 
                key={lang.code} 
                className={`p-4 rounded-lg border text-center cursor-pointer transition-all ${
                  targetLanguage === lang.code 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:bg-accent/50'
                }`}
                onClick={() => setTargetLanguage(lang.code)}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-semibold">{lang.name}</div>
                <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Language Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Cultural Sensitivity</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Respect regional customs and traditions</li>
                <li>• Use appropriate titles and honorifics</li>
                <li>• Consider local festivals and celebrations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Marketing Impact</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Reach customers in their native language</li>
                <li>• Build trust with cultural connection</li>
                <li>• Expand market to regional areas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegionalLanguageSupport;