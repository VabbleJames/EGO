import React, { useState, useEffect } from 'react';

const dummyTrades = [
  { id: 1, trader: '0x7Ac...3Fe4', type: 'YES', amount: 500, dtfId: 1 },
  { id: 2, trader: '0x3Bc...9Ad2', type: 'NO', amount: 750, dtfId: 3 },
  { id: 3, trader: '0x1Df...5Ce8', type: 'YES', amount: 1200, dtfId: 2 },
  { id: 4, trader: '0x9Ee...2Bd5', type: 'NO', amount: 300, dtfId: 1 },
  { id: 5, trader: '0x4Aa...7Fc1', type: 'YES', amount: 900, dtfId: 4 },
  { id: 6, trader: '0x2Cb...1Ae9', type: 'NO', amount: 600, dtfId: 2 },
  { id: 7, trader: '0x8Dd...4Ef3', type: 'YES', amount: 450, dtfId: 3 },
  { id: 8, trader: '0x5Fb...8Dc2', type: 'NO', amount: 1500, dtfId: 4 }
];

const RecentTradeCard = ({ trade, isFlashing }) => {
  return (
    <div 
      className={`
        flex-none bg-black/40 border border-white/10 rounded-lg p-4 w-80
        transition-colors duration-200
        ${isFlashing ? (trade.type === 'YES' ? 'bg-green-500/20' : 'bg-red-500/20') : ''}
      `}
    >
      <div className="text-sm text-gray-400 mb-2">Recent Trade • DTF #{trade.dtfId}</div>
      <div className="text-white">{trade.trader}</div>
      <div className={`text-sm ${trade.type === 'YES' ? 'text-green-500' : 'text-red-500'}`}>
        Bought {trade.type} ${trade.amount}
      </div>
    </div>
  );
};

const RecentTradesFeed = () => {
  const [displayedTrades, setDisplayedTrades] = useState(dummyTrades.slice(0, 3));
  const [flashingStates, setFlashingStates] = useState([false, false, false]);

  const updateTrade = (position) => {
    // Update the trade
    setDisplayedTrades(current => {
      const newTrades = [...current];
      const randomTrade = {
        ...dummyTrades[Math.floor(Math.random() * dummyTrades.length)],
        id: Date.now() + position
      };
      newTrades[position] = randomTrade;
      return newTrades;
    });

    // Set flash state for this position
    setFlashingStates(current => {
      const newStates = [...current];
      newStates[position] = true;
      return newStates;
    });

    // Clear flash after 200ms
    setTimeout(() => {
      setFlashingStates(current => {
        const newStates = [...current];
        newStates[position] = false;
        return newStates;
      });
    }, 200);
  };

  useEffect(() => {
    // Create intervals for each card
    const intervals = [
      setInterval(() => updateTrade(0), 2000),
      setInterval(() => updateTrade(1), 3000),
      setInterval(() => updateTrade(2), 4000)
    ];

    return () => intervals.forEach(interval => clearInterval(interval));
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {displayedTrades.map((trade, index) => (
        <RecentTradeCard 
          key={trade.id} 
          trade={trade} 
          isFlashing={flashingStates[index]}
        />
      ))}
    </div>
  );
};

export default RecentTradesFeed;