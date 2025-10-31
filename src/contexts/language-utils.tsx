import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import translations from '@/lib/translations.json';

// Define available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇮🇳' },
];

// Define the context type
interface LanguageContextType {
  currentLanguage: { code: string; name: string; flag: string };
  translations: any;
  changeLanguage: (langCode: string) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return LANGUAGES.find(lang => lang.code === savedLanguage) || LANGUAGES[0];
  });
  
  const [translationData, setTranslationData] = useState(translations);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // In a real implementation, you would load language-specific translations
        // For now, we're using the static translations from the JSON file
        setTranslationData(translations);
        localStorage.setItem('selectedLanguage', currentLanguage.code);
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    };
    
    loadTranslations();
  }, [currentLanguage]);

  const changeLanguage = (langCode: string) => {
    const language = LANGUAGES.find(lang => lang.code === langCode);
    if (language) {
      setCurrentLanguage(language);
    }
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translationData[currentLanguage.code] || {};
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return original key if translation not found
      }
    }
    
    return value || key;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    translations: translationData,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};