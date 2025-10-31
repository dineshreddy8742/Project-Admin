import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, languages } from "@/contexts/language-utils";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { toast, Toaster } from 'sonner';
import eventBus from '@/lib/eventBus';
import {
  Globe,
  Bell,
  Mic,
  MapPin,
  User,
  Palette,
  Save,
  Volume2,
  Smartphone,
  Shield
} from 'lucide-react';

const Settings = () => {
  const { translateSync } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    language: 'kannada',
    notifications: {
      cropAlerts: true,
      priceUpdates: true,
      weatherWarnings: true,
      schemeUpdates: false
    },
    voice: {
      enabled: true,
      language: 'kannada',
      speed: 'normal'
    },
    location: {
      autoDetect: true,
      city: 'Bangalore',
      state: 'Karnataka'
    },
    profile: {
      name: 'Farmer Krishna',
      farmSize: '5 acres',
      mainCrops: 'Rice, Tomato',
      email: '',
      phone: '',
      state: '',
      district: ''
    },
    theme: 'light'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (user) {
      setCurrentUser(user);
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user.name || 'Farmer Krishna',
          farmSize: user.farmSize || '5 acres',
          mainCrops: user.mainCrops || 'Rice, Tomato',
          email: user.email || '',
          phone: user.phone || '',
          state: user.state || '',
          district: user.district || ''
        }
      }));
    }
  }, []);

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: any }) => {
        setSettings(prev => {
            if (field === 'appLanguage') {
                // This is handled by Profile.tsx, but if we want to handle it here, we would need to update the currentLanguage context
                return prev;
            } else if (field === 'voiceLanguage') {
                return { ...prev, voice: { ...prev.voice, language: value } };
            } else if (field === 'voiceEnabled') {
                return { ...prev, voice: { ...prev.voice, enabled: value } };
            } else if (field === 'speechSpeed') {
                return { ...prev, voice: { ...prev.voice, speed: value } };
            } else if (field === 'cropAlerts') {
                return { ...prev, notifications: { ...prev.notifications, cropAlerts: value } };
            } else if (field === 'priceUpdates') {
                return { ...prev, notifications: { ...prev.notifications, priceUpdates: value } };
            } else if (field === 'weatherWarnings') {
                return { ...prev, notifications: { ...prev.notifications, weatherWarnings: value } };
            } else if (field === 'schemeUpdates') {
                return { ...prev, notifications: { ...prev.notifications, schemeUpdates: value } };
            } else if (field === 'autoDetectLocation') {
                return { ...prev, location: { ...prev.location, autoDetect: value } };
            } else if (field === 'locationCity') {
                return { ...prev, location: { ...prev.location, city: value } };
            } else if (field === 'locationState') {
                return { ...prev, location: { ...prev.location, state: value } };
            }
            return prev;
        });
        toast.info(`Setting ${field} updated to ${value}`);
    };

    eventBus.on('fill-settings-field', handleFillField);

    return () => {
        eventBus.remove('fill-settings-field', handleFillField);
    };
  }, []);

  const handleSave = () => {
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        name: settings.profile.name,
        email: settings.profile.email,
        phone: settings.profile.phone,
        state: settings.profile.state,
        district: settings.profile.district,
        farmSize: settings.profile.farmSize,
        mainCrops: settings.profile.mainCrops
      };
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('agritech_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('agritech_users', JSON.stringify(users));
      }
      
      // Update current user
      localStorage.setItem('agritech_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
    toast.success('Settings saved successfully!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-8"
          >
            <Toaster />
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary/80 bg-clip-text text-transparent font-indian">
                {translateSync('Settings')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {translateSync('Customize your Project Kisan experience')}
              </p>
            </motion.div>

            {/* Profile Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Profile Information')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync('Manage your farming profile and basic information')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/src/assets/farmer-avatar.png" alt="Profile" />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                        FK
                      </AvatarFallback>
                    </Avatar>
                     <div className="space-y-2">
                       <h3 className="text-lg font-semibold">{settings.profile.name}</h3>
                       <div className="flex space-x-2">
                         <Badge variant="secondary">{settings.profile.farmSize}</Badge>
                         <Badge variant="outline">{settings.profile.mainCrops}</Badge>
                         {currentUser?.role && (
                           <Badge variant="outline" className="bg-primary/10 text-primary">
                             {currentUser.role === 'farmer' ? '🚜 Farmer' : 
                              currentUser.role === 'artifact_seller' ? '🏺 Artifact Seller' :
                              currentUser.role === 'administrator' ? '👨‍💼 Administrator' : 'User'}
                           </Badge>
                         )}
                       </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{translateSync('Full Name')}</Label>
                      <Input
                        id="name"
                        value={settings.profile.name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{translateSync('Email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, email: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{translateSync('Phone Number')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, phone: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{translateSync('State')}</Label>
                      <Input
                        id="state"
                        value={settings.profile.state}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, state: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{translateSync('District')}</Label>
                      <Input
                        id="district"
                        value={settings.profile.district}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, district: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">{translateSync('Farm Size')}</Label>
                      <Input
                        id="farmSize"
                        value={settings.profile.farmSize}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, farmSize: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="mainCrops">{translateSync('Main Crops')}</Label>
                      <Textarea
                        id="mainCrops"
                        value={settings.profile.mainCrops}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, mainCrops: e.target.value }
                        }))}
                        placeholder={translateSync("e.g., Rice, Wheat, Cotton")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language Settings */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Language & Region')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync('Choose your preferred language and regional settings')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="language">{translateSync('App Language')}</Label>
                      <Select
                        value={currentUser?.language || 'en'}
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={translateSync("Select language")} />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.nativeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="voiceLang">{translateSync('Voice Language')}</Label>
                      <Select
                        value={settings.voice.language}
                        onValueChange={(value) => setSettings(prev => ({
                          ...prev,
                          voice: { ...prev.voice, language: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={translateSync("Select voice language")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kannada">ಕನ್ನಡ (Kannada)</SelectItem>
                          <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Voice Assistant Settings */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Voice Assistant')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync('Configure voice interaction preferences')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{translateSync('Enable Voice Assistant')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {translateSync('Allow voice commands and responses')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.voice.enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        voice: { ...prev.voice, enabled: checked }
                      }))}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label htmlFor="voiceSpeed">{translateSync('Speech Speed')}</Label>
                    <Select
                      value={settings.voice.speed}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        voice: { ...prev.voice, speed: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={translateSync("Select speed")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4" />
                            <span>{translateSync('Slow')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="normal">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4" />
                            <span>{translateSync('Normal')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fast">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4" />
                            <span>{translateSync('Fast')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Notifications')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync('Manage when and how you receive alerts')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        key: 'cropAlerts',
                        title: 'Crop Health Alerts',
                        description: 'Get notified about crop diseases and health issues'
                      },
                      {
                        key: 'priceUpdates',
                        title: 'Market Price Updates',
                        description: 'Receive alerts when crop prices change significantly'
                      },
                      {
                        key: 'weatherWarnings',
                        title: 'Weather Warnings',
                        description: 'Get alerts for severe weather conditions'
                      },
                      {
                        key: 'schemeUpdates',
                        title: 'Government Scheme Updates',
                        description: 'Stay informed about new agricultural schemes'
                      }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">{translateSync(item.title)}</Label>
                          <p className="text-sm text-muted-foreground">
                            {translateSync(item.description)}
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [item.key]: checked
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Settings */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Location Settings')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync('Manage location preferences for weather and market data')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{translateSync('Auto-detect Location')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {translateSync('Automatically use your current location for accurate data')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.location.autoDetect}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        location: { ...prev.location, autoDetect: checked }
                      }))}
                    />
                  </div>
                  
                  {!settings.location.autoDetect && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{translateSync('City')}</Label>
                        <Input
                          id="city"
                          value={settings.location.city}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{translateSync('State')}</Label>
                        <Input
                          id="state"
                          value={settings.location.state}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            location: { ...prev.location, state: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Settings */}
            <motion.div variants={itemVariants}>
              <Card className="border-accent/20 shadow-soft">
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <Palette className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl font-indian">{translateSync('Theme Settings')}</CardTitle>
                  </div>
                  <CardDescription>
                    {translateSync("Personalize the app's appearance")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="appTheme">{translateSync('App Theme')}</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={translateSync("Select theme")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{translateSync('Light')}</SelectItem>
                        <SelectItem value="dark">{translateSync('Dark')}</SelectItem>
                        <SelectItem value="system">{translateSync('System')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-soft px-8 py-3"
              >
                <Save className="h-5 w-5 mr-2" />
                {translateSync('Save Settings')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;