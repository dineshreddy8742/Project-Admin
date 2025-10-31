import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, Shield } from 'lucide-react';

const iconMap = {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Shield,
};

const MetricsCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => {
  const changeColorClass = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  }[changeType];

  const iconColorClass = {
    primary: 'text-primary',
    success: 'text-success',
    accent: 'text-accent',
    warning: 'text-warning',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      className="bg-card rounded-xl p-5 shadow-warm-md flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mb-2">{value}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-medium ${changeColorClass}`}>{change}</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-full ${iconColorClass} bg-opacity-10`}>
        {React.createElement(iconMap[icon] || TrendingUp, { size: 24 })}
      </div>
    </motion.div>
  );
};

export default MetricsCard;