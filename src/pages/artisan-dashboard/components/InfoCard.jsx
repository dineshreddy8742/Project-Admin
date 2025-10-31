import React from 'react';
import Icon from '../../../components/AppIcon';

const InfoCard = ({ title, description, icon, color = 'primary', onClick }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div onClick={onClick} className={`p-4 rounded-lg transition-all duration-200 cursor-pointer group ${getColorClasses()}`}>
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
          <Icon name={icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1 group-hover:scale-105 transition-transform duration-200">
            {title}
          </h4>
          <p className="text-xs opacity-90 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;