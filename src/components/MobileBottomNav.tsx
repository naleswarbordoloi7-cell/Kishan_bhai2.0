import React from 'react';
import { useApp } from '../context/AppContext';
import { useUserStore } from '../store/userStore';
import { 
  Home, 
  Sparkles, 
  Sprout, 
  TrendingUp, 
  User, 
  Users,
  ShoppingBag, 
  Search, 
  LayoutList,
  Truck,
  Map as MapIcon,
  Wallet
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const userRole = useUserStore(state => state.userRole);
  const { currentView, setCurrentView, t } = useApp();

  let navItems = [];

  if (userRole === 'FARMER') {
    navItems = [
      { id: 'farmer-dashboard', label: 'Home', icon: Home },
      { id: 'community', label: 'Chaupal', icon: Users },
      { id: 'market-prices', label: 'Market', icon: TrendingUp },
      { id: 'my-crops', label: 'Crops', icon: Sprout },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  } else if (userRole === 'BUYER') {
    navItems = [
      { id: 'buyer-dashboard', label: 'Home', icon: Home },
      { id: 'categories', label: 'Categories', icon: ShoppingBag },
      { id: 'search', label: 'Search', icon: Search },
      { id: 'orders', label: 'Orders', icon: LayoutList },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  } else if (userRole === 'CHAMPION') {
    navItems = [
      { id: 'champion-dashboard', label: 'Home', icon: Home },
      { id: 'orders', label: 'Orders', icon: LayoutList },
      { id: 'map', label: 'Map', icon: MapIcon },
      { id: 'earnings', label: 'Earnings', icon: Wallet },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  } else {
    // Default fallback (Admin or unset)
    navItems = [
      { id: 'admin-dashboard', label: 'Home', icon: Home },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  }

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 w-full md:w-[478px] md:left-1/2 md:-translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border-t border-stone-100 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] px-2 pb-safe pt-2 flex items-center justify-around"
    >
      {navItems.map((item) => {
        const isActive =
          currentView === item.id ||
          (item.id === 'farmer-dashboard' && currentView === 'landing') ||
          (item.id === 'profile' && currentView === 'settings');

        const Icon = item.icon;

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-green-700 font-bold'
                : 'text-stone-500 hover:text-stone-700 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg mb-0.5 transition-colors ${
                isActive ? 'bg-green-50 text-green-700' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-none ${isActive ? 'font-semibold text-green-700' : 'text-stone-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Floating AI Assistant for Farmer */}
      {userRole === 'FARMER' && (
        <button
          onClick={() => setCurrentView('ai-assistant')}
          className="absolute -top-6 right-4 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </nav>
  );
};
