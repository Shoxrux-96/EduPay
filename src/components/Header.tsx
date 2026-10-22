import React from 'react';
import { Menu, DollarSign } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenQuickPayment: () => void;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenQuickPayment,
  isConnected,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Moliya va Tizim Tahlili (Dashboard)';
      case 'debtors':
        return 'Qarzdorlar monitoringi';
      case 'students':
        return "O'quvchilar ro'yxati va guruhi";
      case 'history':
        return "Barcha to'lovlar jurnali";
      case 'api':
        return 'API Explorer & Hujjatlar';
      default:
        return 'EduPay Boshqaruv';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile hamburger + Breadcrumbs / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>EduPay</span>
                <span aria-hidden="true">/</span>
                <span className="text-slate-600 capitalize">{activeTab}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {getTabTitle(activeTab)}
              </h1>
            </div>
          </div>

          {/* Right: Real-time badge & Quick Pay Button */}
          <div className="flex items-center gap-3">
            <div
              title={isConnected ? "WebSocket ulangan" : "WebSocket ulanmoqda"}
              className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">WS Real-Time:</span>
              <span className="font-semibold text-slate-900">
                {isConnected ? 'Ulangan' : 'Ulanmoqda'}
              </span>
            </div>

            <button
              onClick={onOpenQuickPayment}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>To'lov</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
