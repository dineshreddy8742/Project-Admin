import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-utils';

export const useTranslation = (textsToTranslate: string[]) => {
  const { translate, translateSync, currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateStaticTexts = async () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      setIsLoading(true);
      const translated: Record<string, string> = {};
      
      for (const text of textsToTranslate) {
        try {
          translated[text] = await translate(text);
        } catch (error) {
          translated[text] = text;
        }
      }
      
      setTranslatedTexts(translated);
      setIsLoading(false);
    };

    translateStaticTexts();
  }, [currentLanguage, translate, textsToTranslate]);

  const t = (text: string) => translatedTexts[text] || translateSync(text) || text;

  return { t, isLoading, translatedTexts };
};