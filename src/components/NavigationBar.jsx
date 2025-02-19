import React, {useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import { HelpCircle } from 'lucide-react';
import WelcomeModal from './WelcomeModal';


function NavigationBar() {
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  const NavLink = ({ to, children, showPulse }) => {
    const isActive = location.pathname === to;
    return (
      <div className="flex items-center gap-2">
        <Link 
          to={to} 
          className={`${
            isActive 
              ? 'text-text-primary' 
              : 'text-text-secondary hover:text-text-primary'
          } transition-colors duration-50`}
        >
          {children}
        </Link>
        {showPulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        )}
      </div>
    );
  };

  return (
    <nav className="w-full bg-body-dark fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo.svg" 
                alt="EGO" 
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Help Icon */}
          <button 
              onClick={() => setShowHelp(true)}
              className="text-text-primary hover:text-text-primary opacity-60 hover:opacity-100 transition-opacity"
              title="How EGO works"
            >
              <HelpCircle size={20} />
            </button>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/trading" showPulse={true}>Live EGOs</NavLink>
            <NavLink to="/ego-farming">EGO Farming</NavLink>
            <NavLink to="/trades">Your Shares</NavLink>
            <NavLink to="/your-dtfs">Your EGOs</NavLink>
            <NavLink to="/create">Create EGO</NavLink>
          </div>



          <WalletConnect />
        </div>
      </div>

      {/* Welcome Modal */}
      {showHelp && <WelcomeModal isOpen={showHelp} onClose={() => setShowHelp(false)} />}
    </nav>
  );
}

export default NavigationBar;