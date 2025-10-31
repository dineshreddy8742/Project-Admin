import React, { useState, useEffect, useContext } from 'react';
import { translateText } from '@/services/translationService';
import { Language, languages, LanguageContext } from './language-utils';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const preferredLanguageCode = localStorage.getItem('preferred-language');
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');

    let languageToSet: Language | undefined;

    if (preferredLanguageCode) {
      languageToSet = languages.find(lang => lang.code === preferredLanguageCode);
    } else if (user && user.language) {
      languageToSet = languages.find(lang => lang.code === user.language);
    }

    if (languageToSet) {
      setCurrentLanguage(languageToSet);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Update preferred-language in localStorage
    localStorage.setItem('preferred-language', language.code);

    // Also update the language in agritech_current_user
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user) {
      user.language = language.code;
      localStorage.setItem('agritech_current_user', JSON.stringify(user));
    }
    
    // Clear cache when language changes
    setTranslationCache(new Map());
  };

  const translate = async (text: string): Promise<string> => {
    // Return original text if it's English
    if (currentLanguage.code === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage.code}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const translatedText = await translateText(text, currentLanguage.code);
      
      // Cache the translation
      setTranslationCache(prev => new Map(prev).set(cacheKey, translatedText));
      
      return translatedText;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Return original text if translation fails
    }
  };

  const translateSync = (text: string): string => {
    // Return original text if it's English
    if (currentLanguage.code === 'en') {
      return text;
    }

    // Check cache for instant translation
    const cacheKey = `${text}-${currentLanguage.code}`;
    return translationCache.get(cacheKey) || text;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      translate, 
      translateSync, 
      translationCache 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};