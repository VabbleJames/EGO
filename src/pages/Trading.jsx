import React, { useState, useEffect, useRef } from 'react';
import { useReadContract } from 'wagmi';
import { SEPOLIA_CONTRACTS } from '../constants/addresses';
import DTFMarket from '../contracts/abis/DTFMarket.json';
import EnhancedDTFCard from '../components/EnhancedDTFCard';
import RecentTradesFeed from '../components/RecentTradesFeed';
import { TrendingUp, Users, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import WelcomeModal from '../components/WelcomeModal';

function Trading() {
  const [dtfIds, setDtfIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const videoRef = useRef(null);

  const { data: nextDtfId } = useReadContract({
    address: SEPOLIA_CONTRACTS.DTF_MARKET,
    abi: DTFMarket,
    functionName: 'nextDtfId'
  });

  useEffect(() => {
    if (nextDtfId) {
      const totalDtfs = Number(nextDtfId) - 1;
      if (totalDtfs > 0) {
        const existingIds = Array.from({ length: totalDtfs }, (_, i) => BigInt(i + 1)).reverse();
        setDtfIds(existingIds);
      }
    }
  }, [nextDtfId]);

  if (videoRef.current) {
    videoRef.current.play().catch(error => {
      console.log("Video autoplay failed:", error);
    });
  }

  // Calculate pagination values
  const totalPages = Math.ceil(dtfIds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDtfs = dtfIds.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  return (

    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

         {/* Background Video */}
      <div className="fixed inset-0 w-full h-full -z-20">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-5"
          autoPlay
          muted
          loop
          playsInline
        >
          <source 
            src="/video/Binary.mp4" 
            type="video/mp4"
          />
        </video>
      </div>

        {/* Enhanced header with trading stats */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2"></h1>
            <div className="text-gray-400">Thought of the day: It's a good idea to start farming... ngl</div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-gray-400 text-sm flex items-center justify-end gap-2">
                <Users size={14} />
                Active Traders
              </div>
              <div className="text-xl font-bold text-white">2.4k</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm flex items-center justify-end gap-2">
                <Activity size={14} />
                24h Volume
              </div>
              <div className="text-xl font-bold text-green-500">$124.5k</div>
            </div>
          </div>
        </div>

        {/* Market Trend Banner */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 rounded-full p-2">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div>
              <div className="text-green-500 font-semibold">Market Trend: Bullish</div>
              <div className="text-gray-400 text-sm">70% of EGOs trending upward</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">Most Active: EGO #23</div>
            <div className="text-gray-400 text-sm">$45.2k volume in last hour</div>
          </div>
        </div>

        {/* Recent Trades Feed */}
        <RecentTradesFeed />

        {/* DTF Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentDtfs.map((id) => (
            <EnhancedDTFCard key={id.toString()} dtfId={id} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      <WelcomeModal />
    </div>
  );
}

export default Trading;