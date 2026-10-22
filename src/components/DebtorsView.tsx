import React, { useState, useEffect } from 'react';
import { Debtor, DebtorsResponse } from '../types';
import { api } from '../services/api';
import {
  Calendar,
  Search,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Phone,
  BookOpen
} from 'lucide-react';

interface DebtorsViewProps {
  onPayForDebtor: (debtor: Debtor) => void;
  refreshTrigger: number;
}

export const DebtorsView: React.FC<DebtorsViewProps> = ({
  onPayForDebtor,
  refreshTrigger,
}) => {
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [data, setData] = useState<DebtorsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchDebtors = async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDebtors(month);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Qarzdorlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors(selectedMonth);
  }, [selectedMonth, refreshTrigger]);

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const filteredDebtors = (data?.debtors || []).filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.group.toLowerCase().includes(q)
    );
  });

  const handleCopyReminder = (debtor: Debtor) => {
    const text = `Assalomu alaykum, hurmatli ${debtor.name}! EduPay o'quv markazidan sizga ${selectedMonth} oyi uchun ${formatUZS(debtor.debt_amount)} miqdorida to'lov qarzini eslatib o'tamiz. Iltimos, o'z vaqtida to'lovni amalga oshiring. Guruh: ${debtor.group}`;
    navigator.clipboard.writeText(text);
    setCopiedId(debtor.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* View Header & Filter Bar */}
      <div className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Oylik qarzdorlar ro'yxati
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              GET /debtors?month={selectedMonth} — Oylik to'lov summasidan kam to'lagan o'quvchilar
            </p>
          </div>

          {/* Month selector & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <label htmlFor="month-select" className="text-xs font-medium text-slate-600 shrink-0">
                Oy:
              </label>
              <input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={() => fetchDebtors(selectedMonth)}
              title="Yangilash"
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Sub-metrics row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi, guruh yoki telefon bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span>
              Qarzdorlar: <strong className="font-mono text-slate-900">{filteredDebtors.length}</strong> nafar
            </span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span>
              Jami qarz: <strong className="font-mono text-rose-600">{formatUZS(data?.total_debt ?? 0)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Debtors List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">Qarzdorlar ro'yxati tekshirilmoqda...</p>
        </div>
      ) : filteredDebtors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {searchQuery ? "Mos keladigan qarzdor topilmadi" : `${selectedMonth} oyi uchun qarzdorlar mavjud emas!`}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery
              ? "Qidiruv so'zini o'zgartirib ko'ring yoki filtrni tozalang."
              : "Ushbu oy uchun barcha o'quvchilar belgilangan to'lovlarini to'liq bajargan."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4"># ID</th>
                    <th className="py-3 px-4">O'quvchi</th>
                    <th className="py-3 px-4">Guruh</th>
                    <th className="py-3 px-4 text-right">Oylik to'lov</th>
                    <th className="py-3 px-4 text-right">To'langan</th>
                    <th className="py-3 px-4 text-right">Qoldiq qarz</th>
                    <th className="py-3 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDebtors.map((debtor) => {
                    const percentPaid = Math.round((debtor.paid_amount / debtor.monthly_fee) * 100);
                    return (
                      <tr key={debtor.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-xs font-medium">
                          #{debtor.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{debtor.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {debtor.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium inline-flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            {debtor.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 tabular-nums">
                          {formatUZS(debtor.monthly_fee)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                          <div>{formatUZS(debtor.paid_amount)}</div>
                          <div className="text-[11px] text-slate-400">
                            {percentPaid}% to'langan ({debtor.payment_count} ta to'lov)
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                          {formatUZS(debtor.debt_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onPayForDebtor(debtor)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>To'lash</span>
                            </button>
                            <button
                              onClick={() => handleCopyReminder(debtor)}
                              title="SMS / Eslatma matnini nusxalash"
                              className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              {copiedId === debtor.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (optimized for phones) */}
          <div className="md:hidden space-y-3">
            {filteredDebtors.map((debtor) => (
              <div
                key={debtor.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-slate-400">#{debtor.id}</div>
                    <h3 className="font-bold text-slate-900 text-base">{debtor.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{debtor.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Qarz:</span>
                    <span className="text-base font-bold font-mono text-rose-600 tabular-nums">
                      {formatUZS(debtor.debt_amount)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Guruh:</span>
                    <span className="font-medium text-slate-900">{debtor.group}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Oylik to'lov:</span>
                    <span className="font-mono tabular-nums text-slate-800">{formatUZS(debtor.monthly_fee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>To'langan:</span>
                    <span className="font-mono tabular-nums text-emerald-600">{formatUZS(debtor.paid_amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onPayForDebtor(debtor)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>To'lov kiritish</span>
                  </button>
                  <button
                    onClick={() => handleCopyReminder(debtor)}
                    aria-label="Eslatmani nusxalash"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedId === debtor.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
