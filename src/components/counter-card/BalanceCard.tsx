import React from 'react';
import './CounterCard.css';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  received?: number;
  earned?: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  currency = 'Hypes', 
  received = 0,
  earned = 0 
}) => {
  return (
    <div className="balance-card">
      <div className="balance-header">
        <div>Your Balance</div>
        <div className="balance-logo">b</div>
      </div>
      <div className="balance-amount">
        {balance} <span className="currency">{currency}</span>
      </div>
      <div className="balance-details">
        <div className="balance-stat">
          <div className="stat-arrow">←</div>
          <div>{received} received</div>
        </div>
        <div className="balance-stat">
          <div className="stat-arrow">→</div>
          <div>{earned} earned</div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;