import React from 'react';
import InfoCard from './InfoCard';

const MetricsCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const description = (
    <>
      <span className="font-bold text-lg">{value}</span>
      {change && (
        <span className={`ml-2 font-semibold ${changeType === 'positive' ? 'text-green-300' : 'text-red-300'}`}>
          ({change})
        </span>
      )}
    </>
  );

  return (
    <InfoCard
      title={title}
      description={description}
      icon={icon}
      color={color}
    />
  );
};

export default MetricsCard;