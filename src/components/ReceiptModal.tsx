import React from 'react';
import { Payment } from '../types';
import { X, CheckCircle, Printer, Download, CreditCard, Calendar, User, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">To'lov muvaffaqiyatli qabul qilindi</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">EduPay To'lov Kvitansiyasi #{payment.id}</p>
        </div>

        {/* Receipt Body */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">O'quvchi:</span>
            <span className="font-semibold text-slate-900 text-sm">{payment.student_name}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Guruh:</span>
            <span className="font-medium text-slate-800">{payment.student_group}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">To'lov sanasi:</span>
            <span className="font-mono text-slate-800">{payment.date}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">To'lov usuli:</span>
            <span className="font-medium text-slate-800">{payment.payment_method || 'Payme'}</span>
          </div>

          {payment.note && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Izoh:</span>
              <span className="text-slate-700 italic">{payment.note}</span>
            </div>
          )}

          <div className="my-2 border-t border-dashed border-slate-200" />

          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-semibold text-slate-900">To'langan summa:</span>
            <span className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
              {formatUZS(payment.amount)}
            </span>
          </div>

          {payment.remaining_debt !== undefined && (
            <div className="flex justify-between items-center py-1 text-slate-600">
              <span>Joriy oydagi qolgan qarz:</span>
              <span className="font-mono font-semibold text-rose-600 tabular-nums">
                {formatUZS(payment.remaining_debt)}
              </span>
            </div>
          )}
        </div>

        {/* Security watermark */}
        <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tranzaksiya real-time WebSocket va ma'lumotlar bazasida tasdiqlandi.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
