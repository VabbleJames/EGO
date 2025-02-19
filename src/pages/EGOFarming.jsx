import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Twitter, MessageCircle, Share2, TrendingUp, PlusCircle, Users, Trophy, Sparkles } from 'lucide-react';

const POINTS_CONFIG = {
  SIGNUP: 50,
  TWITTER_FOLLOW: 10,
  TELEGRAM_JOIN: 15,
  SHARE_MARKET: 30,
  MAKE_TRADE: 5,
  CREATE_EGO: 100
};

const EGOFarming = () => {
  const { address } = useAccount();
  const [userPoints, setUserPoints] = useState(0);
  const [activities, setActivities] = useState({
    hasSignedUp: false,
    hasFollowedTwitter: false,
    hasJoinedTelegram: false,
    marketsShared: 0,
    tradesCount: 0,
    egosCreated: 0
  });

  // Simulated data - replace with actual API calls
  const topFarmers = [
    { address: '0x1234...5678', points: 750, rank: 1 },
    { address: '0x2345...6789', points: 620, rank: 2 },
    { address: '0x3456...7890', points: 580, rank: 3 },
    { address: '0x3456...7890', points: 545, rank: 4 },
    { address: '0x3456...7890', points: 500, rank: 5 },
    { address: '0x3456...7890', points: 485, rank: 6 },
    { address: '0x3456...7890', points: 420, rank: 7 },
    { address: '0x3456...7890', points: 369, rank: 8 },
    { address: '0x3456...7890', points: 250, rank: 9 },
    { address: '0x3456...7890', points: 245, rank: 10 },
  ];

  const handleTwitterFollow = async () => {
    window.open('https://x.com/EGOmarkets', '_blank');
    // Add API call to verify follow
    setActivities(prev => ({ ...prev, hasFollowedTwitter: true }));
    setUserPoints(prev => prev + POINTS_CONFIG.TWITTER_FOLLOW);
  };

  const handleTelegramJoin = async () => {
    window.open('https://t.me/+cWYGvv7aQSA1YWYx', '_blank');
    // Add API call to verify join
    setActivities(prev => ({ ...prev, hasJoinedTelegram: true }));
    setUserPoints(prev => prev + POINTS_CONFIG.TELEGRAM_JOIN);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8"></h1>

      {/* Points Overview */}
      <div className="bg-black rounded-xl p-6 border border-white/20 mb-8">
        <div className="mb-2">
          <h2 className="text-2xl text-white font-bold">Farm Your EGOs.</h2>
        </div>
        <p className="text-gray-400">
          Farming may lead to a future airdrop.
        </p>
        <div className="text-5xl font-bold text-[#22C55E] mb-4">
          {userPoints}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-[#22C55E] h-2 rounded-full transition-all" 
            style={{ width: `${(userPoints % 100)}%` }}
          />
        </div>
        <p className="text-gray-400">
          {100 - (userPoints % 100)} points until next level
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Activities Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Earn Points</h2>
          
          {/* Social Engagement */}
          <div className="bg-black rounded-xl p-6 border border-white/20">
            <div className="mb-4">
              <h3 className="text-xl text-white font-bold">Social Farming</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <Twitter className="text-[#1DA1F2]" />
                  <div>
                    <p className="text-white">Follow EGO on X (Twitter)</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.TWITTER_FOLLOW} points</p>
                  </div>
                </div>
                <button
                  onClick={handleTwitterFollow}
                  disabled={activities.hasFollowedTwitter}
                  className={`px-4 py-2 rounded-lg ${
                    activities.hasFollowedTwitter
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#22C55E] hover:bg-[#16A34A]'
                  }`}
                >
                  {activities.hasFollowedTwitter ? 'Completed' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="text-[#0088cc]" />
                  <div>
                    <p className="text-white">Join EGO Telegram</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.TELEGRAM_JOIN} points</p>
                  </div>
                </div>
                <button
                  onClick={handleTelegramJoin}
                  disabled={activities.hasJoinedTelegram}
                  className={`px-4 py-2 rounded-lg ${
                    activities.hasJoinedTelegram
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#22C55E] hover:bg-[#16A34A]'
                  }`}
                >
                  {activities.hasJoinedTelegram ? 'Completed' : 'Join'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <Share2 className="text-white" />
                  <div>
                    <p className="text-white">Share EGOs</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.SHARE_MARKET} points per share</p>
                  </div>
                </div>
                <span className="text-gray-400">{activities.marketsShared} shared</span>
              </div>
            </div>
          </div>

          {/* Platform Usage */}
          <div className="bg-black rounded-xl p-6 border border-white/20">
            <div className="mb-4">
              <h3 className="text-xl text-white font-bold">EGO Farming</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="text-[#22C55E]" />
                  <div>
                    <p className="text-white">Sign Up Bonus</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.SIGNUP} points</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg ${
                  activities.hasSignedUp ? 'bg-[#22C55E]' : 'bg-gray-600'
                }`}>
                  {activities.hasSignedUp ? 'Claimed' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-[#22C55E]" />
                  <div>
                    <p className="text-white">Trade EGOs</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.MAKE_TRADE} points per trade</p>
                  </div>
                </div>
                <span className="text-gray-400">{activities.tradesCount} trades</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg">
                <div className="flex items-center gap-3">
                  <PlusCircle className="text-[#22C55E]" />
                  <div>
                    <p className="text-white">Create EGOs</p>
                    <p className="text-sm text-gray-400">+{POINTS_CONFIG.CREATE_EGO} points per EGO</p>
                  </div>
                </div>
                <span className="text-gray-400">{activities.egosCreated} created</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
<div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/20">
  <div className="flex items-center gap-4 mb-6">
    <Trophy className="w-8 h-8 text-yellow-500" />
    <h2 className="text-2xl text-white font-bold">Top Farmers</h2>
  </div>
  
  <div className="space-y-4 overflow-visible">
    {topFarmers.map((farmer, index) => (
      <div
        key={farmer.address}
        className={`relative group ${index === 0 ? 'p-[1px]' : ''}`}
      >
        {/* Gradient border for first position */}
        {index === 0 && (
          <div 
            className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 animate-border-pulse overflow-visible"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(217,217,217,0) 0%, rgba(234,128,81,1) 33%, rgba(234,128,81,1) 56%, rgba(93,27,154,1) 70%, rgba(115,115,115,0) 100%)',
              backgroundSize: '200% 100%'
            }}
          />
        )}
        
        {/* Content */}
        <div className={`flex items-center justify-between p-4 rounded-xl 
          ${index === 0 
            ? 'bg-[#000000] relative z-10 border border-white/20 group-hover:border-transparent' 
            : 'bg-[#1E1E1E] border border-white/10 hover:border-[#22C55E]/50'} 
          transition-all duration-200 hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
              ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                'bg-gray-700'} 
              font-bold text-2xl text-white transform hover:scale-110 transition-transform`}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-white font-bold">{farmer.address}</p>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <p className="text-[#22C55E] font-bold">{farmer.points} points</p>
              </div>
            </div>
          </div>
          
          {index === 0 && (
            <div className="px-3 py-1 bg-yellow-500/20 rounded-lg text-yellow-500 text-sm font-bold animate-pulse">
              LEADER
                 </div>
                 )}
             </div>
             </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EGOFarming;