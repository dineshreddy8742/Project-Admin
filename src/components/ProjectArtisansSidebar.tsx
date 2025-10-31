import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, ShoppingCart, Star, Settings, LifeBuoy, Sparkles, UserCheck, LayoutDashboard, ChevronLeft, History, Languages, BookOpen, TrendingUp, Search, MessageCircle, BarChart3, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/language-utils';
import { useAuth } from '@/contexts/ArtomartAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface ProjectArtisansSidebarProps {
  onClose: () => void;
}

export const ProjectArtisansSidebar: React.FC<ProjectArtisansSidebarProps> = ({ onClose }) => {
  const { t: languageT } = useLanguage();
  const { userProfile } = useAuth();

  const navGroups = [
    {
      title: 'Store',
      items: [
        { to: '/artisans/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: '🏠 Dashboard' },
        { to: '/artisans/products', icon: <ShoppingCart className="h-5 w-5" />, label: '📦 My Products' },
        { to: '/artisans/orders', icon: <Star className="h-5 w-5" />, label: '📋 My Orders' },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { to: '/artisans/marketing-hub', icon: <Sparkles className="h-5 w-5" />, label: '📢 Marketing Hub', pro: true },
        { to: '/artisans/heritage-story', icon: <History className="h-5 w-5" />, label: '🏛️ Heritage Story', pro: true },
        { to: '/artisans/regional-language', icon: <Languages className="h-5 w-5" />, label: '🌐 Regional Language', pro: true },
        { to: '/artisans/craft-education', icon: <BookOpen className="h-5 w-5" />, label: '🎓 Craft Education', pro: true },
        { to: '/artisans/market-trends', icon: <TrendingUp className="h-5 w-5" />, label: '📊 Market Trends', pro: true },
        { to: '/artisans/search', icon: <Search className="h-5 w-5" />, label: '🔍 Search & Discover', pro: true },
        { to: '/artisans/reviews', icon: <MessageCircle className="h-5 w-5" />, label: '💬 Reviews & Feedback', pro: true },

        { to: '/marketplace', icon: <Package className="h-5 w-5" />, label: '🛒 Marketplace' },
        { to: '/artisans/community', icon: <UserCheck className="h-5 w-5" />, label: '👥 Community' },
      ],
    },
    {
      title: 'General',
      items: [
        { to: '/settings', icon: <Settings className="h-5 w-5" />, label: '⚙️ Settings' },
        { to: '/help', icon: <LifeBuoy className="h-5 w-5" />, label: '❓ Help' },
      ],
    },
  ];

  if (userProfile?.role === 'admin') {
    navGroups.push({
      title: 'Admin',
      items: [
        { to: '/admin/dashboard', icon: <UserCheck className="h-5 w-5" />, label: 'Admin Dashboard' },
      ],
    });
  }

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col h-full min-h-screen">
      <div className="p-5 border-b border-border">
        <h2 className="text-2xl font-bold text-primary">Project Artisans</h2>
      </div>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userProfile?.profile_image_url} alt={userProfile?.name} />
            <AvatarFallback className="text-lg">{userProfile?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-lg">{userProfile?.name}</p>
            <p className="text-sm text-muted-foreground">{languageT('Artisan')}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="py-3">
            <h3 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{languageT(group.title)}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`
                  }
                >
                  {item.icon}
                  <span className="flex-1">{languageT(item.label)}</span>
                  {item.pro && (
                    <span className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full">PRO</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-5 border-t border-border mt-auto">
        <Button variant="outline" className="w-full justify-start gap-2 py-3">
          <LifeBuoy className="h-5 w-5" />
          {languageT('Help & Support')}
        </Button>
      </div>
    </aside>
  );
};
