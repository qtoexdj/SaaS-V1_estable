import React from 'react';
import './CounterCard.css';

interface StatCardProps {
  value: number | string;
  label: string;
  description?: string;
  type?: 'default' | 'deposited' | 'withdrawn';
}

const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  description, 
  type = 'default' 
}) => {
  const cardClassNames = `stat-counter-card ${type}`;

  return (
    <div className={cardClassNames}>
      <div className="stat-value">
        {value}
      </div>
      <div className="stat-label">
        {label}
      </div>
      {description && (
        <div className="stat-description">
          {description}
        </div>
      )}
    </div>
  );
};

export default StatCard;