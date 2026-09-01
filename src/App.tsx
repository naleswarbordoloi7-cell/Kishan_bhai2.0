import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PaymentModal } from './components/PaymentModal';
import { WalletConnect } from './components/WalletConnect';
import { NfcModal } from './components/NfcModal';
import { ToastContainer } from './components/ToastContainer';
import { ApiRetryNotification } from './components/ApiRetryNotification';
import { LogoIntroSplash } from './components/LogoIntroSplash';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { BiometricPromptModal } from './components/BiometricPromptModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { ChampionDashboard } from './pages/ChampionDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminX402Analytics } from './pages/AdminX402Analytics';
import { VirtualFarmClustersPage } from './pages/VirtualFarmClusters';
import { BulkBuyingPage } from './pages/BulkBuying';
import { HarvestPoolingPage } from './pages/HarvestPooling';
import { BuyerMarketplacePage } from './pages/BuyerMarketplace';
import { MachineryPage } from './pages/Machinery';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { WeatherModule } from './pages/WeatherModule';
import { TransactionsPage } from './pages/TransactionsPage';
import { FarmProfilePage } from './pages/FarmProfile';
import { AuthPage } from './pages/AuthPage';
import { LoginPage } from './pages/LoginPage';
import { MyCropsPage } from './pages/MyCropsPage';
import { DiseaseScannerPage } from './pages/DiseaseScannerPage';
import { SmartIrrigationPage } from './pages/SmartIrrigationPage';
import { SoilHealthPage } from './pages/SoilHealthPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { ProfitCalculatorPage } from './pages/ProfitCalculatorPage';
import { CropRecommendationPage } from './pages/CropRecommendationPage';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage';
import { FarmDiaryPage } from './pages/FarmDiaryPage';
import { CommunityPage } from './pages/CommunityPage';
import { TalkToExpertPage } from './pages/TalkToExpertPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const {
    currentView,
    isLogoSplashOpen,
    setIsLogoSplashOpen,
    isBiometricModalOpen,
    setIsBiometricModalOpen,
    biometricPromptOptions,
  } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'farmer-dashboard':
        return <FarmerDashboard />;
      case 'champion-dashboard':
        return <ChampionDashboard />;
      case 'buyer-dashboard':
        return <BuyerDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-x402':
        return <AdminX402Analytics />;
      case 'clusters':
        return <VirtualFarmClustersPage />;
      case 'bulk-buying':
        return <BulkBuyingPage />;
      case 'harvest':
        return <HarvestPoolingPage />;
      case 'marketplace':
        return <BuyerMarketplacePage />;
      case 'machinery':
        return <MachineryPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'weather':
        return <WeatherModule />;
      case 'transactions':
        return <TransactionsPage />;
      case 'profile':
        return <FarmProfilePage />;
      case 'my-crops':
        return <MyCropsPage />;
      case 'disease-scanner':
        return <DiseaseScannerPage />;
      case 'smart-irrigation':
        return <SmartIrrigationPage />;
      case 'soil-health':
        return <SoilHealthPage />;
      case 'market-prices':
        return <MarketPricesPage />;
      case 'profit-calculator':
        return <ProfitCalculatorPage />;
      case 'crop-recommendation':
        return <CropRecommendationPage />;
      case 'government-schemes':
        return <GovernmentSchemesPage />;
      case 'farm-diary':
        return <FarmDiaryPage />;
      case 'community':
        return <CommunityPage />;
      case 'talk-to-expert':
        return <TalkToExpertPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'auth':
      case 'login':
        return <LoginPage />;
      default:
        return <LandingPage />;
    }
  };

  const isLanding = currentView === 'landing' || currentView === 'auth' || currentView === 'login';

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-stone-900 font-sans antialiased selection:bg-emerald-200">
      <Navbar />

      <div className="flex-1 flex w-full">
        {!isLanding && <Sidebar />}

        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ApiRetryNotification />
      <PaymentModal />
      <WalletConnect />
      <NfcModal />
      <OfflineManagerModal />
      <BiometricPromptModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        title={biometricPromptOptions.title}
        subtitle={biometricPromptOptions.subtitle}
        actionReason={biometricPromptOptions.actionReason}
        targetUserId={biometricPromptOptions.targetUserId}
        onSuccess={(user) => {
          if (biometricPromptOptions.onSuccess) {
            biometricPromptOptions.onSuccess(user);
          }
        }}
      />
      <LogoIntroSplash
        isOpen={isLogoSplashOpen}
        onClose={() => setIsLogoSplashOpen(false)}
      />
      <ToastContainer />
      {!isLanding && <MobileBottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
