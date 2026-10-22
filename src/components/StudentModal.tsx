import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { api } from '../services/api';
import { X, User, Phone, BookOpen, DollarSign, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [group, setGroup] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setPhone(studentToEdit.phone);
      setGroup(studentToEdit.group);
      setMonthlyFee(String(studentToEdit.monthly_fee));
    } else {
      setName('');
      setPhone('+998 ');
      setGroup('');
      setMonthlyFee('');
    }
    setError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !group.trim() || !monthlyFee) {
      setError("Barcha maydonlarni to'ldirish shart");
      return;
    }

    const fee = parseInt(monthlyFee.replace(/[^0-9]/g, ''), 10);
    if (isNaN(fee) || fee <= 0) {
      setError("Oylik to'lov summasi musbat son bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      if (studentToEdit) {
        await api.updateStudent(studentToEdit.id, {
          name: name.trim(),
          phone: phone.trim(),
          group: group.trim(),
          monthly_fee: fee,
        });
      } else {
        await api.createStudent({
          name: name.trim(),
          phone: phone.trim(),
          group: group.trim(),
          monthly_fee: fee,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Amalni bajarishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 mb-1">
          {studentToEdit ? "O'quvchi ma'lumotlarini tahrirlash" : "Yangi o'quvchi qo'shish"}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ism, telefon raqami, guruh nomi va oylik to'lov summasini kiriting
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ism va familiya *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Masalan: Sardor Rustamov"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Telefon raqami *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Guruh nomi *
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Masalan: Frontend React (FN-101)"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Oylik to'lov summasi (so'mda) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                required
                min="1000"
                step="1000"
                placeholder="1500000"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Saqlanmoqda..." : studentToEdit ? "O'zgarishlarni saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
