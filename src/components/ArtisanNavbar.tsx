 import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, HelpCircle, User, ChevronDown, Globe, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/contexts/language-utils';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import artisanAvatar from '@/assets/artisan-avatar.png';

interface ArtisanNavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const ArtisanNavbar: React.FC<ArtisanNavbarProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const { t: languageT, currentLanguage, setLanguage } = useLanguage();
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});

  // Refs for click outside detection
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (languagesRef.current && !languagesRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Translate static texts when language changes
  useEffect(() => {
    const translateStaticTexts = async () => {
      if (currentLanguage.code === 'en') {
        setTranslatedTexts({});
        return;
      }

      const textsToTranslate = [
        'Notifications',
        'Settings',
        'Sign Out',
        'Language'
      ];

      const translated: Record<string, string> = {};

      for (const text of textsToTranslate) {
        try {
          translated[text] = languageT(text);
        } catch (error) {
          translated[text] = text;
        }
      }

      setTranslatedTexts(translated);
    };

    translateStaticTexts();
  }, [currentLanguage, languageT]);

  const t = (text: string) => translatedTexts[text] || languageT(text) || text;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft"
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="hover:bg-primary/10 transition-bounce"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          </Button>

          {/* Logo and App Name */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={artisanAvatar}
              alt="Project Kisan"
              className="h-10 w-10 rounded-full shadow-soft"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-indian">
                Project Kisan
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {t('Digital Farming Assistant')}
              </p>
            </div>
          </motion.div>
          <Button
            variant="ghost"
            onClick={() => navigate('/artifacts')}
            className="hover:bg-primary/10 transition-bounce"
          >
            <img src={artisanAvatar} alt="Artisan" className="h-6 w-6 mr-2" />
            {t('Project Artisans')}
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <div className="relative hidden md:block" ref={languagesRef}>
            <Button
              variant="ghost"
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs">
                {currentLanguage.nativeName}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showLanguages && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-card border p-2 z-50"
              >
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguages(false);
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </Button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Notifications - Artisan specific */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:bg-accent/10 transition-bounce relative"
            >
              <Bell className="h-5 w-5" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-card border p-4 z-50"
              >
                <h3 className="font-semibold mb-3">{t('Notifications')}</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-accent/10 rounded text-sm">
                    🛍️ {t('New order received for your products')}
                  </div>
                  <div className="p-2 bg-primary/10 rounded text-sm">
                    ⭐ {t('New review on your artisan products')}
                  </div>
                  <div className="p-2 bg-secondary/10 rounded text-sm">
                    📈 {t('Your product views increased by 25%')}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/help')}
            className="hover:bg-primary/10 transition-bounce"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              className="p-1 hover:bg-accent/10 transition-bounce"
              onClick={() => setShowProfile(!showProfile)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={artisanAvatar} alt="Profile" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>

            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-card border p-4 z-50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artisanAvatar} alt="Profile" />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{userProfile?.name || t('Artisan')}</h4>
                    <p className="text-sm text-muted-foreground">{userProfile?.email || t('Project Artisans Platform')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      navigate('/settings');
                      setShowProfile(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    {t('Settings')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-destructive gap-2"
                    onClick={async () => {
                      await signOut();
                      setShowProfile(false);
                      // Navigate to login page after sign out
                      navigate('/login');
                    }}
                  >
                    <User className="h-4 w-4" />
                    {t('Sign Out')}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
