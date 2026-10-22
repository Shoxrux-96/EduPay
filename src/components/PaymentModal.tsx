import React, { useState, useEffect } from 'react';
import { Student, Payment, Debtor } from '../types';
import { api } from '../services/api';
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  User,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  preselectedDebtor?: Debtor | null;
  onPaymentSuccess: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  students,
  preselectedDebtor,
  onPaymentSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [studentId, setStudentId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(today);
  const [paymentMethod, setPaymentMethod] = useState<string>('Payme');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedDebtor) {
        setStudentId(preselectedDebtor.id);
        setAmount(String(preselectedDebtor.debt_amount));
      } else if (students.length > 0 && !studentId) {
        setStudentId(students[0].id);
        setAmount(String(students[0].monthly_fee));
      }
      setError(null);
    }
  }, [isOpen, preselectedDebtor, students]);

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === Number(studentId));

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const handlePresetAmount = (val: number) => {
    setAmount(String(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId) {
      setError("Iltimos, o'quvchini tanlang");
      return;
    }

    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("To'lov summasi musbat son bo'lishi shart");
      return;
    }

    if (!date) {
      setError("To'lov sanasini tanlang");
      return;
    }

    setLoading(true);
    try {
      const result = await api.createPayment({
        student_id: Number(studentId),
        amount: numAmount,
        date,
        payment_method: paymentMethod,
        note: note.trim() || undefined,
      });

      onPaymentSuccess(result);
      onClose();
      // Reset
      setAmount('');
      setNote('');
    } catch (err: any) {
      setError(err.message || "To'lovni kiritishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Yangi to'lov kiritish</h2>
              <p className="text-xs text-slate-500">
                O'quvchi to'lovini tizimga qayd qilish va balansni yangilash
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student selection */}
          <div>
            <label htmlFor="modal-student-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              O'quvchi *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                id="modal-student-select"
                value={studentId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setStudentId(val);
                  const st = students.find((s) => s.id === val);
                  if (st && !preselectedDebtor) {
                    setAmount(String(st.monthly_fee));
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                required
              >
                <option value="">-- O'quvchini tanlang --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.group}) — {formatUZS(s.monthly_fee)}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex flex-wrap items-center justify-between gap-1 text-slate-600">
                <span>Guruh: <strong className="text-slate-900">{selectedStudent.group}</strong></span>
                <span>Tel: <strong className="font-mono text-slate-900">{selectedStudent.phone}</strong></span>
                <span>Oylik to'lov: <strong className="font-mono text-slate-900">{formatUZS(selectedStudent.monthly_fee)}</strong></span>
              </div>
            )}
          </div>

          {/* Amount input & presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="modal-amount-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                To'lov summasi (so'mda) *
              </label>
              {selectedStudent && (
                <button
                  type="button"
                  onClick={() => handlePresetAmount(selectedStudent.monthly_fee)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  To'liq oylik ({formatUZS(selectedStudent.monthly_fee)})
                </button>
              )}
            </div>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="modal-amount-input"
                type="number"
                placeholder="1200000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
                min="1000"
                step="1000"
              />
            </div>

            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[300000, 500000, 1000000, 1200000, 1500000, 1800000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors font-mono"
                >
                  {new Intl.NumberFormat('uz-UZ').format(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-date-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Sana *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="modal-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-method-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                To'lov usuli
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  id="modal-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Payme">Payme</option>
                  <option value="Click">Click</option>
                  <option value="Uzum Bank">Uzum Bank</option>
                  <option value="Naqd">Naqd pul (Kassaga)</option>
                  <option value="Bank o'tkazmasi">Bank o'tkazmasi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="modal-note-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Izoh (ixtiyoriy)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="modal-note-input"
                type="text"
                placeholder="Masalan: 1-qism to'lov, kvitansiya #..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-lg transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Kiritilmoqda...</span>
                </>
              ) : (
                <>
                  <span>To'lovni tasdiqlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
