import React, { useEffect, useState } from 'react';
import { Student, Payment } from '../types';
import { api } from '../services/api';
import { X, Calendar, CreditCard, RefreshCw, AlertCircle, FileText } from 'lucide-react';

interface StudentHistoryModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  student,
  onClose,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getStudentPayments(student.id);
        setPayments(res.payments);
        setTotalPaid(res.total_paid);
      } catch (err: any) {
        setError(err.message || "To'lovlar tarixini yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [student]);

  if (!student) return null;

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="text-xs font-mono text-slate-400">ID #{student.id}</span>
          <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
            <span>Guruh: <strong>{student.group}</strong></span>
            <span>·</span>
            <span>Tel: <strong className="font-mono">{student.phone}</strong></span>
            <span>·</span>
            <span>Oylik: <strong className="font-mono text-slate-800">{formatUZS(student.monthly_fee)}</strong></span>
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg mb-4 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Barcha to'lovlar summasi:</span>
          <span className="text-base font-bold font-mono text-emerald-600 tabular-nums">
            {formatUZS(totalPaid)}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-xs">To'lovlar tarixi yuklanmoqda...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <p className="text-sm">Ushbu o'quvchi tomonidan hali to'lov amalga oshirilmagan.</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold font-mono text-slate-900 text-sm tabular-nums">
                    {formatUZS(p.amount)}
                  </div>
                  <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {p.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {p.payment_method || 'Payme'}
                    </span>
                  </div>
                  {p.note && (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">"{p.note}"</p>
                  )}
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  Chek #{p.id}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
