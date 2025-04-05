import React from 'react';
import './CounterCard.css';

interface RevenueSource {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface RevenueChartProps {
  sources: RevenueSource[];
  timeframe?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  sources, 
  timeframe = 'All Time' 
}) => {
  return (
    <div className="revenue-chart-card">
      <div className="revenue-chart-header">
        <h3>Distribución de Prospectos</h3>
        <div className="timeframe-selector">
          {timeframe}
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      <div className="revenue-chart-content">
        <div className="chart-container">
          <div className="donut-chart">
            {sources.map((source, index) => (
              <div 
                key={index} 
                className="donut-segment" 
                style={{
                  '--percent': `${source.percentage}%`,
                  '--color': source.color,
                  '--offset': `${sources
                    .slice(0, index)
                    .reduce((acc, curr) => acc + curr.percentage, 0)}%`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="revenue-sources-list">
          {sources.map((source, index) => (
            <div key={index} className="revenue-source-item">
              <div className="source-info">
                <div 
                  className="source-color-indicator" 
                  style={{ backgroundColor: source.color }}
                />
                <span className="source-name">{source.name}</span>
              </div>
              <div className="source-value">
                {source.value} Prospectos
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;