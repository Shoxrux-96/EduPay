import { Student, Payment, DebtorsResponse, StatsResponse, AnalyticsResponse } from '../types';

export const api = {
  // Students API
  async getStudents(params?: { search?: string; group?: string }): Promise<Student[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.group) query.append('group', params.group);
    const res = await fetch(`/api/students?${query.toString()}`);
    if (!res.ok) throw new Error('O‘quvchilar ro‘yxatini yuklab bo‘lmadi');
    return res.json();
  },

  async createStudent(data: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'O‘quvchini qo‘shishda xatolik');
    }
    return res.json();
  },

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'O‘quvchi ma‘lumotlarini o‘zgartirishda xatolik');
    }
    return res.json();
  },

  async deleteStudent(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'O‘quvchini o‘chirishda xatolik');
    }
    return res.json();
  },

  async getStudentPayments(id: number): Promise<{ student: Student; total_paid: number; payments: Payment[] }> {
    const res = await fetch(`/api/students/${id}/payments`);
    if (!res.ok) throw new Error('O‘quvchi to‘lovlarini yuklab bo‘lmadi');
    return res.json();
  },

  // Payments API
  async getPayments(params?: { student_id?: number; month?: string }): Promise<Payment[]> {
    const query = new URLSearchParams();
    if (params?.student_id) query.append('student_id', params.student_id.toString());
    if (params?.month) query.append('month', params.month);
    const res = await fetch(`/api/payments?${query.toString()}`);
    if (!res.ok) throw new Error('To‘lovlar ro‘yxatini yuklab bo‘lmadi');
    return res.json();
  },

  async createPayment(data: {
    student_id: number;
    amount: number;
    date: string;
    payment_method?: string;
    note?: string;
  }): Promise<Payment> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'To‘lovni kiritishda xatolik');
    }
    return res.json();
  },

  // Debtors API: GET /debtors?month=YYYY-MM
  async getDebtors(month: string): Promise<DebtorsResponse> {
    const res = await fetch(`/debtors?month=${encodeURIComponent(month)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Qarzdorlar ro‘yxatini yuklab bo‘lmadi');
    }
    return res.json();
  },

  // Stats
  async getStats(): Promise<StatsResponse> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Statistika ma‘lumotlarini yuklab bo‘lmadi');
    return res.json();
  },

  // Deep Analytics and Reports: GET /api/analytics?year=YYYY
  async getAnalytics(year?: string): Promise<AnalyticsResponse> {
    const query = year ? `?year=${encodeURIComponent(year)}` : '';
    const res = await fetch(`/api/analytics${query}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Tahliliy hisobotlarni yuklab bo‘lmadi');
    }
    return res.json();
  },
};
