import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, HelpCircle, User, ChevronDown, Globe, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/contexts/language-utils';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import CartIcon from './CartIcon';
import farmerAvatar from '@/assets/farmer-avatar.png';
import artisanAvatar from '@/assets/artisan-avatar.png';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const { currentLanguage, setLanguage, translate, translateSync } = useLanguage();
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

  console.log('userProfile?.role:', userProfile?.role);
  const userAvatar = (userProfile?.role === 'artifact_seller' || userProfile?.role === 'artisan') ? artisanAvatar : farmerAvatar;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/10"
    >
      <div className="flex items-center px-6 h-20 max-w-7xl mx-auto w-full">
        {/* Left section - now with logo, app name, and additional info */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="hover:bg-primary/10 transition-all duration-300 transform hover:scale-110"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          </Button>

          {/* Logo and App Name */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={userAvatar}
              alt={(userProfile?.role === 'artifact_seller' || userProfile?.role === 'artisan') ? 'Project Artisan' : 'Project Kisan'}
              className="h-12 w-12 rounded-full shadow-xl border-2 border-primary/30 p-1 bg-card object-cover"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <div className="border-l border-primary/20 pl-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-indian tracking-wide">
                {(userProfile?.role === 'artifact_seller' || userProfile?.role === 'artisan') ? 'Project Artisan' : 'Project Kisan'}
              </h1>
              <p className="text-xs font-medium text-primary/80 hidden sm:block mt-0.5">
                {(userProfile?.role === 'artifact_seller' || userProfile?.role === 'artisan') ? translateSync('Digital Artifact Assistant') : translateSync('Digital Farming Assistant')}
              </p>
            </div>
          </motion.div>
          
          {/* Additional info moved to left side */}
          <div className="hidden lg:flex items-center space-x-6 text-xs font-medium text-primary/80 ml-6">
            <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Live</span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span>Smart AI</span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Spacer to push right section to the end - this takes up remaining space */}
        <div className="flex-1"></div>

        {/* Right section - only for profile and other controls */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="relative hidden md:block" ref={languagesRef}>
            <Button
              variant="outline"
              onClick={() => setShowLanguages(!showLanguages)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentLanguage.nativeName}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showLanguages && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 mt-2 w-52 bg-card/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary/20 p-2 z-50"
              >
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguages(false);
                    }}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.nativeName}</span>
                  </Button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 transform hover:scale-110 relative border-primary/30"
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
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary/20 p-4 z-50"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary"><Bell className="h-4 w-4" /> {t('Notifications')}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-3 bg-gradient-to-r from-accent/20 to-primary/10 rounded-lg border border-accent/20 text-sm flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                    <span>🌾 {translateSync('Crop monitoring alert: Low soil moisture detected')}</span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-primary/20 to-secondary/10 rounded-lg border border-primary/20 text-sm flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span>📈 {translateSync('Tomato prices increased by 12% today')}</span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-secondary/20 to-accent/10 rounded-lg border border-secondary/20 text-sm flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                    <span>🏛️ {translateSync('New subsidy scheme available for drip irrigation')}</span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/5 rounded-lg border border-primary/20 text-sm flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                    <span>🌿 {translateSync('New organic farming certification program launched')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Help */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/help')}
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 transform hover:scale-110 border-primary/30"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <CartIcon />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="outline"
              className="p-1.5 hover:bg-accent/10 hover:border-primary/50 transition-all duration-300 transform hover:scale-105 border-primary/30 rounded-full"
              onClick={() => setShowProfile(!showProfile)}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={userAvatar} alt="Profile" />
                <AvatarFallback className="bg-primary/10 text-primary/80">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>

            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary/20 p-4 z-50"
              >
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-primary/10">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={userAvatar} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary/80">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-primary text-lg">{userProfile?.name || translateSync('Farmers Friend')}</h4>
                    <p className="text-sm text-muted-foreground">{userProfile?.email || translateSync('Karnataka, India')}</p>
                    <p className="text-xs text-primary/60 mt-1">Active • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="space-y-2">

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-lg hover:bg-primary/10 transition-all duration-200 border-primary/20"
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
                    className="w-full justify-start text-destructive gap-2 rounded-lg hover:bg-destructive/10 transition-all duration-200 border-destructive/20"
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
