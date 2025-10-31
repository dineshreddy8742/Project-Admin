import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', nativeName: 'اردو', flag: '🇮🇳' },
];

// Export languages as an alias for backward compatibility
export const languages = LANGUAGES;

// Define the context type
interface LanguageContextType {
  currentLanguage: { code: string; name: string; nativeName: string; flag: string };
  translations: any;
  changeLanguage: (langCode: string) => void;
  t: (key: string) => string;
  translate: (text: string) => Promise<string>;
  translateSync: (text: string) => string;
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
  
  const [translationData, setTranslationData] = useState<any>({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`@/lib/translations/${currentLanguage.code}.json`);
        setTranslationData(translations.default);
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
    let value: any = translationData[currentLanguage.code] || translationData;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return original key if translation not found
      }
    }

    return value || key;
  };

  // Async translation function using translation service
  const translate = async (text: string): Promise<string> => {
    if (currentLanguage.code === 'en') {
      return text;
    }

    try {
      return await translateText(text, currentLanguage.code, 'en');
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Synchronous translation function - tries local translations first, falls back to original text
  const translateSync = (text: string): string => {
    if (currentLanguage.code === 'en') {
      return text;
    }

    // Try to find translation in local translations first
    const localTranslation = t(text);
    if (localTranslation !== text) {
      return localTranslation;
    }

    // For now, return original text for sync translation
    // In a real implementation, you might want to cache translations
    return text;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    translations: translationData,
    changeLanguage,
    t,
    translate,
    translateSync
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};