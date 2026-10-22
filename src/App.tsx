import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DashboardView } from './components/DashboardView';
import { DebtorsView } from './components/DebtorsView';
import { StudentsView } from './components/StudentsView';
import { PaymentsHistoryView } from './components/PaymentsHistoryView';
import { ApiExplorer } from './components/ApiExplorer';
import { StudentModal } from './components/StudentModal';
import { StudentHistoryModal } from './components/StudentHistoryModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Student, Payment, Debtor, StatsResponse, WebSocketEvent } from './types';
import { api } from './services/api';
import { useWebSocket } from './hooks/useWebSocket';
import {
  BarChart3,
  AlertCircle,
  Users,
  DollarSign,
  History,
  Terminal,
  CheckCircle,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [preselectedDebtor, setPreselectedDebtor] = useState<Debtor | null>(null);

  // Live real-time toast notification
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);

  // Handle WebSocket events
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    if (event.type === 'PAYMENT_ADDED') {
      const p = event.data?.payment;
      const s = event.data?.student;
      setToast({
        title: "Yangi to'lov qabul qilindi!",
        message: `${s?.name || "O'quvchi"} tomonidan ${new Intl.NumberFormat('uz-UZ').format(p?.amount || 0)} so'm to'landi (Real-time).`,
        type: 'success',
      });
      // Trigger background refetch of stats, analytics, debtors and students
      setRefreshTrigger((prev) => prev + 1);
    } else if (event.type === 'STUDENT_CREATED') {
      const s = event.data;
      setToast({
        title: "Yangi o'quvchi qo'shildi",
        message: `${s?.name} (${s?.group}) tizimga muvaffaqiyatli kiritildi.`,
        type: 'info',
      });
      setRefreshTrigger((prev) => prev + 1);
    } else if (event.type === 'STUDENT_UPDATED') {
      setRefreshTrigger((prev) => prev + 1);
    } else if (event.type === 'STUDENT_DELETED') {
      setToast({
        title: "O'quvchi o'chirildi",
        message: `${event.data?.name || 'O‘quvchi'} tizimdan o'chirildi.`,
        type: 'info',
      });
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []);

  const { isConnected } = useWebSocket(handleWebSocketEvent);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [fetchedStudents, fetchedStats] = await Promise.all([
        api.getStudents(),
        api.getStats(),
      ]);
      setStudents(fetchedStudents);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  // Handlers for payments and modals
  const handleOpenQuickPayment = () => {
    setPreselectedDebtor(null);
    setIsPaymentModalOpen(true);
  };

  const handlePayForDebtor = (debtor: Debtor) => {
    setPreselectedDebtor(debtor);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (payment: Payment) => {
    setReceiptPayment(payment);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddStudent = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar containing:
          - EduPay Brand
          - Dashboard & Tahlil
          - Qarzdorlar
          - O'quvchilar
          - To'lovlar tarixi
          - API Explorer
          - + To'lov qilish (Opens PaymentModal)
          - WS Real-Time status indicator
      */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnected={isConnected}
        onOpenQuickPayment={handleOpenQuickPayment}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-8">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenQuickPayment={handleOpenQuickPayment}
          isConnected={isConnected}
        />

        {/* Real-time Toast Banner */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Stats Overview (hidden on dashboard since dashboard has comprehensive KPIs) */}
          {activeTab !== 'dashboard' && (
            <StatsBar stats={stats} loading={loadingStats} />
          )}

          {/* View Switcher */}
          {activeTab === 'dashboard' && (
            <DashboardView
              refreshTrigger={refreshTrigger}
              onOpenPaymentModal={handleOpenQuickPayment}
            />
          )}

          {activeTab === 'debtors' && (
            <DebtorsView
              onPayForDebtor={handlePayForDebtor}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              loading={loadingStats}
              onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
              onViewHistory={(s) => setHistoryStudent(s)}
              onEditStudent={handleEditStudent}
              onAddStudent={handleAddStudent}
            />
          )}

          {activeTab === 'history' && (
            <PaymentsHistoryView refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'api' && <ApiExplorer />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fast thumb reach on small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'debtors' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span>Qarzdorlar</span>
        </button>

        <button
          onClick={handleOpenQuickPayment}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-indigo-600"
        >
          <div className="w-7 h-7 -mt-2 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm">
            <DollarSign className="w-4 h-4" />
          </div>
          <span>To'lov</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'students' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>O'quvchilar</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'history' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5" />
          <span>Tarix</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'api' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span>API</span>
        </button>
      </nav>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPreselectedDebtor(null);
        }}
        students={students}
        preselectedDebtor={preselectedDebtor}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        studentToEdit={studentToEdit}
      />

      <StudentHistoryModal
        student={historyStudent}
        onClose={() => setHistoryStudent(null)}
      />

      <ReceiptModal
        payment={receiptPayment}
        onClose={() => setReceiptPayment(null)}
      />
    </div>
  );
}
