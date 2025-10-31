
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingReportProps {
  timer: number;
}

const LoadingReport: React.FC<LoadingReportProps> = ({ timer }) => {
  const messages = [
    "Bheema is thinking...",
    "Analyzing image patterns...",
    "Comparing with known diseases...",
    "Your results are on the way...",
  ];

  const currentMessage = messages[Math.floor((40 - timer) / 10) % messages.length];
  const progress = (40 - timer) / 40;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 text-center p-8 bg-gray-50 rounded-lg"
    >
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <motion.circle
            className="text-primary"
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress) }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary">
          {timer}s
        </div>
      </div>
      <div className="text-xl font-semibold text-gray-700">{currentMessage}</div>
      <div className="text-sm text-muted-foreground">Please wait while we process the image.</div>
      <div className="space-y-4 pt-4">
        <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default LoadingReport;
