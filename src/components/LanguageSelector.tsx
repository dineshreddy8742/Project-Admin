import React from 'react';
import { useLanguage, LANGUAGES } from '@/contexts/language-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <Select onValueChange={changeLanguage} value={currentLanguage.code}>
      <SelectTrigger className="w-48 bg-background/80 backdrop-blur-sm border-2 border-primary/20 rounded-full shadow-lg transition-all duration-300 hover:border-primary/40 focus:ring-2 focus:ring-primary/50">
        <SelectValue>
          <div className="flex items-center">
            <span className="mr-2 text-lg">{currentLanguage.flag}</span>
            <span className="font-semibold">{currentLanguage.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background/90 backdrop-blur-sm border-primary/20 rounded-xl shadow-lg">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="hover:bg-primary/10 focus:bg-primary/20 transition-all duration-200 rounded-md">
            <div className="flex items-center">
              <span className="mr-3 text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;