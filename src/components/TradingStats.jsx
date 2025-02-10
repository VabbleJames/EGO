import React from 'react';

const StatCard = ({ title, value, change }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="text-gray-600 text-sm">{title}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    <div className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change > 0 ? '+' : ''}{change}%
    </div>
  </div>
);

const TradingStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Traded Volume" 
        value={stats.volume} 
        change={stats.volumeChange} 
      />
      <StatCard 
        title="Active DTFs" 
        value={stats.activeDtfs} 
        change={stats.dtfsChange} 
      />
      <StatCard 
        title="DTF TVL" 
        value={stats.tvl} 
        change={stats.tvlChange} 
      />
      <StatCard 
        title="Active Wallets" 
        value={stats.wallets} 
        change={stats.walletsChange} 
      />
    </div>
  );
};

export default TradingStats;