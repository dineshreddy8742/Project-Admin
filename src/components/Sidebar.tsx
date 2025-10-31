import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Wheat, 
  Bug, 
  TrendingUp, 
  Building2, 
  X,
  Home,
  Settings,
  LogOut,
  Bot,
  ShoppingCart,
  User,
  LogIn,
  Snowflake,
  Package
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { usePlan } from '@/contexts/PlanContext';

interface SidebarProps {
  onClose: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Overview'
  },
  {
    title: 'Crop Monitor',
    url: '/crop-monitor',
    icon: Wheat,
    description: '🌾 Real-time monitoring'
  },
  {
    title: 'Crop Recommendation',
    url: '/crop-recommendation',
    icon: TrendingUp,
    description: '🌱 AI-powered suggestions'
  },
  {
    title: 'Disease Detector',
    url: '/disease-detector',
    icon: Bug,
    description: '🦠 AI Diagnosis'
  },
  {
    title: 'Market Trends',
    url: '/market-trends',
    icon: TrendingUp,
    description: '📊 Price Analysis'
  },
  {
    title: 'Gov Schemes',
    url: '/government-schemes',
    icon: Building2,
    description: '🏛️ Available Benefits'
  },
  {
    title: 'Cold Storage',
    url: '/cold-storage',
    icon: Snowflake,
    description: '❄️ Storage Access'
  },
  
  {
    title: 'Grocery Market',
    url: '/grocery-marketplace',
    icon: ShoppingCart,
    description: '🛒 Buy & sell produce'
  },
  {
    title: 'Community',
    url: '/community',
    icon: User,
    description: '🧑‍🤝‍🧑 Discussion forum'
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
    description: '👤 Account settings'
  }
];

const bottomMenuItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'App preferences'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { hasFeatureAccess } = usePlan();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };


  return (
    <motion.div
      className="w-80 h-screen bg-card/95 backdrop-blur-md border-r border-border shadow-card flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-primary font-indian">
            Navigation
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose your farming tool
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Main Features
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.3,
                  }}
                >
                  <NavLink
                    to={item.url}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "hover:bg-accent/10 hover:text-accent-foreground"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        active
                          ? "bg-primary-foreground/20"
                          : "bg-accent/20 group-hover:bg-accent/30"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-2 h-2 bg-accent rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="border-t border-border pt-4 mt-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Account
          </h3>
          <nav className="space-y-1">
            {bottomMenuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: (index + menuItems.length) * 0.1,
                    duration: 0.3,
                  }}
                >
                  <NavLink
                    to={item.url}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "hover:bg-accent/10 hover:text-accent-foreground"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        active
                          ? "bg-primary-foreground/20"
                          : "bg-accent/20 group-hover:bg-accent/30"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-xs text-muted-foreground">
            Project Kisan v1.0
          </p>
          <p className="text-xs text-accent font-medium">
            Digital Farming Assistant
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};