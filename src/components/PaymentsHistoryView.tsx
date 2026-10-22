import React, { useState, useEffect } from 'react';
import { Payment } from '../types';
import { api } from '../services/api';
import { Search, Calendar, RefreshCw, CreditCard, DollarSign } from 'lucide-react';

interface PaymentsHistoryViewProps {
  refreshTrigger: number;
}

export const PaymentsHistoryView: React.FC<PaymentsHistoryViewProps> = ({
  refreshTrigger,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const list = await api.getPayments({
        month: filterMonth || undefined,
      });
      setPayments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filterMonth, refreshTrigger]);

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const sName = (p.student_name || '').toLowerCase();
    const sGroup = (p.student_group || '').toLowerCase();
    const note = (p.note || '').toLowerCase();
    return sName.includes(q) || sGroup.includes(q) || note.includes(q) || p.date.includes(q);
  });

  const totalSum = filtered.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Barcha to'lovlar jurnali
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              GET /api/payments — Tizimdagi barcha to'lov operatsiyalari va kvitansiyalar
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
              />
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold ml-1"
                >
                  Hammasi
                </button>
              )}
            </div>

            <button
              onClick={fetchPayments}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search bar & Total */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi, guruh yoki izoh bo'yicha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Jami ko'rsatilgan to'lovlar summasi: <strong className="font-mono text-emerald-600 text-sm">{formatUZS(totalSum)}</strong> ({filtered.length} ta)
          </div>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          To'lovlar yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">To'lovlar topilmadi</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4"># Chek ID</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Guruh</th>
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4">To'lov usuli</th>
                  <th className="py-3 px-4 text-right">Summa</th>
                  <th className="py-3 px-4">Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400 font-medium">
                      #{p.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.student_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {p.student_group}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {p.date}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {p.payment_method || 'Payme'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatUZS(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {p.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
