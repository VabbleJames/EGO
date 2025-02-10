import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';

function NavigationBar() {
  const location = useLocation();

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`${
          isActive 
            ? 'text-text-primary' 
            : 'text-text-secondary hover:text-text-primary'
        } transition-colors duration-200`}
      >
        {children}
      </Link>
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

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/trading">DTF Trading</NavLink>
            <NavLink to="/trades">Your Trades</NavLink>
            <NavLink to="/your-dtfs">Your DTFs</NavLink>
            <NavLink to="/create">Create DTF</NavLink>
          </div>

          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;