import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import Trading from './pages/Trading';
import CreateDTF from './pages/CreateDTF';
import YourTrades from './pages/YourTrades';
import Settings from './pages/Settings';
import YourDTFs from './pages/YourDTFs';
import LoadingScreen from './components/LoadingScreen';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import EGOFarming from './pages/EGOFarming';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('Checking animation: animate-rgb-flow class should be active');
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleConnect = async () => {
    // Wallet connection logic will go here
    console.log('Connecting wallet...');
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <Router>
        <div
          className="relative min-h-screen bg-body-dark text-text-primary overflow-hidden"
          onMouseMove={handleMouseMove}
        >

          {/* Background Video */}
<div className="fixed inset-0 w-full h-full -z-30">
  <video
    className="w-full h-full object-cover opacity-40"
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

          {/* Grid Pattern Background */}
          <div
            className="fixed inset-0 w-full h-full opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
                 `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Grid Beams */}
          <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden">

            {/* Horizontal Beam */}
            {/* Horizontal Beam */}
            <div
              className="absolute top-1/2 left-0 right-0 w-[150px] h-[2px] bg-beam-gradient animate-beam-x blur-[1px]"
            />
          </div>

          {/* Cursor Spotlight 
        <div
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{
            background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 100%)`,
          }}
        /> */}

          {/* Main Content */}
          <div className="relative z-10">
            <NavigationBar
              onConnect={handleConnect}
              isConnected={isConnected}
              walletAddress={walletAddress}
            />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Trading />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/create" element={<CreateDTF />} />
                <Route path="/trades" element={<YourTrades />} />
                <Route path="/your-dtfs" element={<YourDTFs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ego-farming" element={<EGOFarming />} />
              </Routes>
            </div>
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </Router>
    </>
  );
}

export default App;