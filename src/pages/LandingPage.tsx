import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  TrendingUp, 
  Shield, 
  MessageCircle, 
  MapPin, 
  Settings,
  Users,
  Leaf,
  Sun,
  CloudRain,
  Activity,
  Bell,
  X,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';

const LandingPage = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification after 1 second
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);

    // Auto hide notification after 5 seconds
    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-yellow-400 via-sky-400 to-orange-400 overflow-hidden relative">
      {/* Notification Pop-up */}
      {showNotification && (
        <motion.div 
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed top-6 right-6 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm"
        >
          <div className="flex-1">
            <p className="font-medium">👋 Welcome!</p>
            <p className="text-sm opacity-90">Start your journey with Project Kisan today.</p>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="text-white hover:bg-white/20 p-1 rounded"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated Shapes */}
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute top-20 right-20 w-16 h-16 bg-yellow-300/20 rounded-full"
          animate={{ 
            y: [0, 30, 0],
            x: [0, 20, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.div 
          className="absolute bottom-20 left-20 w-24 h-24 bg-green-400/15 rounded-full"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating Farming Elements */}
        <motion.div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-white/20"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf size={60} />
        </motion.div>

        <motion.div 
          className="absolute top-1/3 right-1/4 text-yellow-300/30"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Sun size={70} />
        </motion.div>

        <motion.div 
          className="absolute bottom-1/3 left-1/4 text-blue-300/25"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <CloudRain size={50} />
        </motion.div>

        <motion.div 
          className="absolute bottom-20 right-20 text-green-400/30"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <Sprout size={80} />
        </motion.div>

        {/* IoT Sensors Animation */}
        <motion.div 
          className="absolute top-1/2 left-1/3 text-blue-400/25"
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Activity size={40} />
        </motion.div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-6xl mx-auto">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sprout className="text-white h-8 w-8" />
            <span className="text-2xl font-bold text-white">
              Project Kisan
            </span>
          </motion.div>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button asChild variant="outline" className="border-white/30 text-white hover:border-white hover:bg-white/10">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Welcome to Project Kisan 🌾
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Empowering farmers with technology for a sustainable future
          </motion.p>
          
          {/* Crop, Sun and IoT Sensors Illustration */}
          <motion.div 
            className="flex justify-center items-center mb-12 space-x-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <motion.div 
              className="text-green-300"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sprout size={60} />
            </motion.div>
            <motion.div 
              className="text-yellow-300"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sun size={80} />
            </motion.div>
            <motion.div 
              className="text-blue-300"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Activity size={50} />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            {/* Start Your Journey Button - Most prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.3, type: "spring", bounce: 0.4 }}
              whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 25px 50px rgba(255, 165, 0, 0.4)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white text-xl px-8 py-4 sm:px-12 sm:py-6 rounded-full font-bold shadow-2xl border-2 border-white/20 backdrop-blur-sm transition-all duration-500">
                <Link to="/signup">🚀 Start Your Journey</Link>
              </Button>
            </motion.div>

            {/* Continue Your Path Button (Login) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.5, type: "spring", bounce: 0.3 }}
              whileHover={{ 
                scale: 1.06, 
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl px-6 py-3 sm:px-10 sm:py-6 rounded-full font-semibold shadow-xl border-2 border-white/30 backdrop-blur-sm transition-all duration-500">
                <Link to="/login">🗝️ Continue Path</Link>
              </Button>
            </motion.div>

            {/* Join Adventure Button (Sign Up) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.7, type: "spring", bounce: 0.2 }}
              whileHover={{ 
                scale: 1.06, 
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xl px-6 py-3 sm:px-10 sm:py-6 rounded-full font-semibold shadow-xl border-2 border-white/25 backdrop-blur-sm transition-all duration-500">
                <Link to="/signup">🌟 Join Adventure</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          {[
            {
              icon: <Sprout className="h-10 w-10 text-green-600" />,
              title: "🌱 Crop Disease Detection",
              description: "AI-powered early detection and prevention of plant diseases with advanced image recognition and real-time monitoring.",
              delay: 0.1
            },
            {
              icon: <CloudRain className="h-10 w-10 text-blue-600" />,
              title: "🌦️ Real-Time Weather & Sensors",
              description: "Live weather updates, soil monitoring, and environmental sensors to optimize farming conditions.",
              delay: 0.2
            },
            {
              icon: <TrendingUp className="h-10 w-10 text-orange-600" />,
              title: "📊 Market Price Trends",
              description: "Stay updated with latest market prices, trends, and optimal selling strategies for maximum profit.",
              delay: 0.3
            },
            {
              icon: <Bell className="h-10 w-10 text-purple-600" />,
              title: "📡 Smart Alerts & Notifications",
              description: "Intelligent notifications for crop care, weather warnings, and market opportunities.",
              delay: 0.4
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 + feature.delay }}
              whileHover={{ 
                scale: 1.08,
                boxShadow: "0 25px 50px rgba(255,255,255,0.3)"
              }}
              className="group cursor-pointer"
            >
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/30 hover:border-white/60 transition-all duration-500 h-full shadow-xl rounded-2xl">
                <motion.div 
                  className="flex items-center mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="transform group-hover:scale-110 transition-transform duration-300 bg-white/50 p-3 rounded-full">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 mb-16 border border-white/30 shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-10 text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            Trusted by Farmers Nationwide
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,000+", label: "Active Farmers" },
              { number: "5M+", label: "Acres Monitored" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 2.2 + (index * 0.2) }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-5xl font-bold text-green-600 mb-3">{stat.number}</div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.8 }}
        >
          <motion.h2 
            className="text-4xl font-bold mb-6 text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            Ready to Transform Your Farming?
          </motion.h2>
          <motion.p 
            className="text-white/90 mb-8 max-w-2xl mx-auto text-xl leading-relaxed drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.2 }}
          >
            Join the agricultural revolution today. Get access to all our premium features 
            and start optimizing your farm operations with cutting-edge technology.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 3.4 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-white/90 text-xl px-12 py-6 rounded-full font-semibold shadow-xl">
              <Link to="/signup">Start Your Journey</Link>
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-16 bg-gradient-to-r from-gray-900 via-green-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Brand Section */}
            <motion.div 
              className="text-center md:text-left"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sprout className="text-green-400 h-8 w-8" />
                </motion.div>
                <span className="text-2xl font-bold text-white">Project Kisan</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Empowering farmers with technology for a sustainable future.
              </p>
            </motion.div>

            {/* Links Section */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-white">Quick Links</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {['About', 'Contact', 'Privacy Policy', 'Terms of Use', 'FAQ'].map((link, index) => (
                  <motion.div
                    key={link}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="#" 
                      className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
                    >
                      {link}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center md:text-right">
              <h3 className="text-xl font-semibold mb-6 text-white">Follow Us</h3>
              <div className="flex justify-center md:justify-end gap-6 mb-6">
                {[
                  { icon: <Linkedin size={24} />, name: 'LinkedIn', color: 'hover:text-blue-400' },
                  { icon: <Facebook size={24} />, name: 'Facebook', color: 'hover:text-blue-500' },
                  { icon: <Instagram size={24} />, name: 'Instagram', color: 'hover:text-pink-400' },
                  { icon: <MessageCircle size={24} />, name: 'Discord', color: 'hover:text-purple-400' }
                ].map((social, index) => (
                  <motion.div
                    key={social.name}
                    whileHover={{ 
                      scale: 1.2,
                      boxShadow: "0 0 20px rgba(255,255,255,0.3)"
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link 
                      to="#" 
                      className={`text-gray-300 ${social.color} transition-all duration-300 p-2 rounded-full hover:bg-white/10`}
                    >
                      {social.icon}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div 
            className="text-center pt-8 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-gray-400 text-sm mb-3">
              © 2025 Project Kisan. All Rights Reserved.
            </p>
            <p className="text-gray-500 text-xs">
              Powered by React, Tailwind CSS, and Modern Web Technologies.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;