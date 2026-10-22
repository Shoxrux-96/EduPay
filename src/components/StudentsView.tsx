import React, { useState } from 'react';
import { Student } from '../types';
import { api } from '../services/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Phone,
  BookOpen,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  loading: boolean;
  onRefresh: () => void;
  onViewHistory: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onAddStudent: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  loading,
  onRefresh,
  onViewHistory,
  onEditStudent,
  onAddStudent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = Array.from(new Set(students.map((s) => s.group))).filter(Boolean);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.group.toLowerCase().includes(q);
    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteStudent(id);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "O'quvchini o'chirishda xatolik");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              O'quvchilar boshqaruvi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              1-Qism: CRUD amallari — Yangi qo'shish, ro'yxat, tahrirlash, o'chirish va to'lovlar tarixi
            </p>
          </div>

          <button
            onClick={onAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi o'quvchi qo'shish</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ism, telefon yoki guruh bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Group filter select element */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <label htmlFor="student-group-filter" className="sr-only">Guruh bo'yicha filtr</label>
            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="student-group-filter"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Barcha guruhlar ({students.length})</option>
              {groups.map((grp) => {
                const count = students.filter(s => s.group === grp).length;
                return (
                  <option key={grp} value={grp}>
                    {grp} ({count} ta o'quvchi)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              O'quvchini o'chirishni tasdiqlaysizmi?
            </h3>
            <p className="text-xs text-slate-500">
              Ushbu amal o'quvchi ma'lumotlarini bazadan butunlay o'chiradi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirilsin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table / List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          O'quvchilar ro'yxati yuklanmoqda...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-slate-700">Hech qanday o'quvchi topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">Yangi o'quvchi qo'shishingiz yoki qidiruvni tozalashingiz mumkin</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4"># ID</th>
                    <th className="py-3 px-4">Ism va familiya</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Guruh</th>
                    <th className="py-3 px-4 text-right">Oylik to'lov summasi</th>
                    <th className="py-3 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-xs font-medium">
                        #{student.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {student.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {student.group}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatUZS(student.monthly_fee)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewHistory(student)}
                            title="To'lovlar tarixi"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(student.id)}
                            title="O'chirish"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400">#{student.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {student.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Oylik to'lov:</span>
                    <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      {formatUZS(student.monthly_fee)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {student.group}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewHistory(student)}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Tarix</span>
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(student.id)}
                      className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
