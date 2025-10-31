import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import eventBus from '@/lib/eventBus';
import { VoiceAssistant } from './VoiceAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleClickElement = (event: CustomEvent<{ target: string }>) => {
      const element = document.querySelector(event.detail.target) as HTMLElement;
      if (element) {
        element.click();
      }
    };

    eventBus.on('click-element', handleClickElement);

    return () => {
      eventBus.remove('click-element', handleClickElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-rural-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-farm-leaf rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-farm-sun rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-farm-soil rounded-full animate-float"></div>
      </div>

      {/* Navbar */}
      <Navbar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40"
              style={{ position: 'fixed', top: 0, bottom: 0, left: 0 }}
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content with responsive sidebar spacing */}
        <main 
          className={`
            flex-1 pt-16 px-4 pb-20 lg:px-8 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'ml-80' : 'ml-0'}
          `}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      {/* Global VoiceAssistant for all dashboard/artisan pages */}
      <VoiceAssistant />
    </div>
  );
};