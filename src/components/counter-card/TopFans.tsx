import React from 'react';
import './CounterCard.css';

interface Fan {
  id: string;
  name: string;
  username: string;
  avatar: string;
  score: number;
}

interface TopFansProps {
  fans: Fan[];
}

const TopFans: React.FC<TopFansProps> = ({ fans }) => {
  return (
    <div className="top-fans-card">
      <div className="top-fans-header">
        <h3>Top Fans</h3>
        <a href="#">See All</a>
      </div>
      <div className="top-fans-list">
        {fans.map((fan) => (
          <div key={fan.id} className="top-fan-item">
            <div className="fan-info">
              <div className="fan-avatar">
                <img src={fan.avatar} alt={fan.name} />
              </div>
              <div>
                <div className="fan-name">{fan.name}</div>
                <div className="fan-username">@{fan.username}</div>
              </div>
            </div>
            <div className="fan-score">
              {fan.score}
              <div className="score-icon">b</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopFans;