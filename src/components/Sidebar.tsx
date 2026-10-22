import React from 'react';
import { DollarSign, Users, AlertCircle, History, Terminal, BarChart3, X } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'debtors' | 'students' | 'history' | 'api';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isConnected: boolean;
  onOpenQuickPayment: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isConnected,
  onOpenQuickPayment,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard & Tahlil', icon: BarChart3 },
    { id: 'debtors' as ActiveTab, label: 'Qarzdorlar', icon: AlertCircle },
    { id: 'students' as ActiveTab, label: "O'quvchilar", icon: Users },
    { id: 'history' as ActiveTab, label: "To'lovlar tarixi", icon: History },
    { id: 'api' as ActiveTab, label: 'API Explorer', icon: Terminal },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  const handleQuickPayClick = () => {
    onOpenQuickPayment();
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            EP
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              EduPay
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Boshqaruv paneli
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={handleQuickPayClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
        >
          <DollarSign className="w-4 h-4" />
          <span>+ To'lov qilish</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Asosiy bo'limlar
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* WebSocket & Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800">
              WS Real-Time
            </span>
          </div>
          <span
            className={`text-[11px] font-medium ${
              isConnected ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {isConnected ? 'Faol' : 'Ulanmoqda...'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
          Jonli bildirishnomalar va to'lov monitoringi yoqilgan
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (Always visible on lg and above) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
