import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-utils';

export const useTranslation = (textsToTranslate: string[]) => {
  const { t, currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateStaticTexts = () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      setIsLoading(true);
      const translated: Record<string, string> = {};
      
      for (const text of textsToTranslate) {
        try {
          translated[text] = t(text);
        } catch (error) {
          translated[text] = text;
        }
      }
      
      setTranslatedTexts(translated);
      setIsLoading(false);
    };

    translateStaticTexts();
  }, [currentLanguage, t, textsToTranslate]);

  const translatedText = (text: string) => translatedTexts[text] || t(text) || text;

  return { t: translatedText, isLoading, translatedTexts };
};