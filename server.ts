import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Student {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthly_fee: number;
  created_at: string;
}

interface Payment {
  id: number;
  student_id: number;
  amount: number;
  date: string; // YYYY-MM-DD
  payment_method?: string;
  note?: string;
  created_at: string;
}

// Initial realistic seed data for the test task
let nextStudentId = 7;
let nextPaymentId = 17;

const students: Student[] = [
  {
    id: 1,
    name: "Alisher Navoiy",
    phone: "+998 90 123 45 67",
    group: "Frontend React (FN-101)",
    monthly_fee: 1200000,
    created_at: "2026-08-01",
  },
  {
    id: 2,
    name: "Zulayho Karimova",
    phone: "+998 93 987 65 43",
    group: "Python Django (PY-202)",
    monthly_fee: 1500000,
    created_at: "2026-08-15",
  },
  {
    id: 3,
    name: "Javohir Toshmatov",
    phone: "+998 97 555 44 33",
    group: "Frontend React (FN-101)",
    monthly_fee: 1200000,
    created_at: "2026-09-01",
  },
  {
    id: 4,
    name: "Madina Rahimova",
    phone: "+998 91 333 22 11",
    group: "Fullstack Ecomdev (EC-303)",
    monthly_fee: 1800000,
    created_at: "2026-09-10",
  },
  {
    id: 5,
    name: "Sardorbek Olimov",
    phone: "+998 94 777 88 99",
    group: "Python Django (PY-202)",
    monthly_fee: 1500000,
    created_at: "2026-09-15",
  },
  {
    id: 6,
    name: "Nigora Usmonova",
    phone: "+998 99 444 33 22",
    group: "Fullstack Ecomdev (EC-303)",
    monthly_fee: 1800000,
    created_at: "2026-10-01",
  },
];

const payments: Payment[] = [
  // Payments for current month (2026-10)
  {
    id: 1,
    student_id: 1,
    amount: 1200000, // Full payment
    date: "2026-10-05",
    payment_method: "Payme",
    note: "10-oy uchun to'liq to'lov",
    created_at: "2026-10-05T10:30:00Z",
  },
  {
    id: 2,
    student_id: 2,
    amount: 1000000, // Partial payment (debt: 500,000)
    date: "2026-10-08",
    payment_method: "Click",
    note: "1-qism to'lov",
    created_at: "2026-10-08T14:20:00Z",
  },
  {
    id: 3,
    student_id: 4,
    amount: 800000, // Partial payment (debt: 1,000,000)
    date: "2026-10-12",
    payment_method: "Bank o'tkazmasi",
    note: "Avans to'lovi",
    created_at: "2026-10-12T09:15:00Z",
  },
  {
    id: 4,
    student_id: 6,
    amount: 1800000, // Full payment
    date: "2026-10-15",
    payment_method: "Naqd",
    note: "Kassaga to'landi",
    created_at: "2026-10-15T11:45:00Z",
  },
  // Previous month (2026-09) payments
  {
    id: 5,
    student_id: 1,
    amount: 1200000,
    date: "2026-09-05",
    payment_method: "Payme",
    created_at: "2026-09-05T10:00:00Z",
  },
  {
    id: 6,
    student_id: 2,
    amount: 1500000,
    date: "2026-09-07",
    payment_method: "Click",
    created_at: "2026-09-07T11:00:00Z",
  },
  {
    id: 7,
    student_id: 3,
    amount: 1200000,
    date: "2026-09-10",
    payment_method: "Naqd",
    created_at: "2026-09-10T15:00:00Z",
  },
  // Historical payments (2026-08)
  {
    id: 9,
    student_id: 1,
    amount: 1200000,
    date: "2026-08-05",
    payment_method: "Payme",
    created_at: "2026-08-05T10:00:00Z",
  },
  {
    id: 10,
    student_id: 2,
    amount: 1500000,
    date: "2026-08-07",
    payment_method: "Click",
    created_at: "2026-08-07T11:00:00Z",
  },
  // Historical payments (2026-07)
  {
    id: 11,
    student_id: 1,
    amount: 1200000,
    date: "2026-07-06",
    payment_method: "Uzum Bank",
    created_at: "2026-07-06T10:00:00Z",
  },
  {
    id: 12,
    student_id: 2,
    amount: 1500000,
    date: "2026-07-08",
    payment_method: "Payme",
    created_at: "2026-07-08T11:00:00Z",
  },
  // Historical payments (2026-06)
  {
    id: 13,
    student_id: 1,
    amount: 1200000,
    date: "2026-06-05",
    payment_method: "Naqd",
    created_at: "2026-06-05T10:00:00Z",
  },
  {
    id: 14,
    student_id: 2,
    amount: 1500000,
    date: "2026-06-09",
    payment_method: "Click",
    created_at: "2026-06-09T11:00:00Z",
  },
  // Historical payments (2026-05)
  {
    id: 15,
    student_id: 1,
    amount: 1200000,
    date: "2026-05-05",
    payment_method: "Click",
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: 16,
    student_id: 2,
    amount: 1500000,
    date: "2026-05-08",
    payment_method: "Payme",
    created_at: "2026-05-08T11:00:00Z",
  },
];

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // WebSocket connection & broadcasting
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    // Send initial handshake
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'WebSocket orqali real-time aloqa o‘rnatildi',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (e) {
        // Ignore unparseable frames
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  const broadcast = (event: string, data: any) => {
    const payload = JSON.stringify({ type: event, data, timestamp: new Date().toISOString() });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  // 1-QISM: O'quvchilar API
  // 1. Yangi o‘quvchi qo‘shish: POST /api/students
  app.post('/api/students', (req: Request, res: Response): any => {
    const { name, phone, group, monthly_fee } = req.body;

    if (!name || !phone || !group || monthly_fee === undefined) {
      return res.status(400).json({
        error: "Barcha maydonlar to‘ldirilishi shart: name, phone, group, monthly_fee"
      });
    }

    const fee = Number(monthly_fee);
    if (isNaN(fee) || fee <= 0) {
      return res.status(400).json({
        error: "Oylik to‘lov summasi musbat son bo‘lishi kerak"
      });
    }

    const newStudent: Student = {
      id: nextStudentId++,
      name: String(name).trim(),
      phone: String(phone).trim(),
      group: String(group).trim(),
      monthly_fee: fee,
      created_at: new Date().toISOString().split('T')[0]
    };

    students.push(newStudent);
    broadcast('STUDENT_CREATED', newStudent);

    return res.status(201).json(newStudent);
  });

  // 2. O‘quvchilar ro‘yxatini olish: GET /api/students
  app.get('/api/students', (req: Request, res: Response) => {
    const { search, group } = req.query;
    let result = [...students];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.group.toLowerCase().includes(q)
      );
    }

    if (group && typeof group === 'string') {
      result = result.filter(s => s.group === group);
    }

    res.json(result);
  });

  // 3. O‘quvchi ma’lumotlarini o‘zgartirish: PUT/PATCH /api/students/:id
  const updateStudentHandler = (req: Request, res: Response): any => {
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "O‘quvchi topilmadi" });
    }

    const { name, phone, group, monthly_fee } = req.body;

    if (name !== undefined) students[index].name = String(name).trim();
    if (phone !== undefined) students[index].phone = String(phone).trim();
    if (group !== undefined) students[index].group = String(group).trim();
    if (monthly_fee !== undefined) {
      const fee = Number(monthly_fee);
      if (isNaN(fee) || fee <= 0) {
        return res.status(400).json({ error: "Oylik to‘lov summasi musbat son bo‘lishi kerak" });
      }
      students[index].monthly_fee = fee;
    }

    const updated = students[index];
    broadcast('STUDENT_UPDATED', updated);

    return res.json(updated);
  };

  app.put('/api/students/:id', updateStudentHandler);
  app.patch('/api/students/:id', updateStudentHandler);

  // 4. O‘quvchini o‘chirish: DELETE /api/students/:id
  app.delete('/api/students/:id', (req: Request, res: Response): any => {
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "O‘quvchi topilmadi" });
    }

    const deleted = students.splice(index, 1)[0];
    broadcast('STUDENT_DELETED', { id: deleted.id, name: deleted.name });

    return res.json({ message: "O‘quvchi muvaffaqiyatli o‘chirildi", deleted });
  });

  // 2-QISM: To'lovlar API
  // 1. To‘lov qo‘shish: POST /api/payments
  app.post('/api/payments', (req: Request, res: Response): any => {
    const { student_id, amount, date, payment_method, note } = req.body;

    if (!student_id || amount === undefined || !date) {
      return res.status(400).json({
        error: "Barcha majburiy maydonlarni to‘ldiring: student_id, amount, date (YYYY-MM-DD)"
      });
    }

    const student = students.find(s => s.id === Number(student_id));
    if (!student) {
      return res.status(404).json({ error: "Bunday ID li o‘quvchi topilmadi" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "To‘lov summasi musbat son bo‘lishi kerak" });
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(String(date))) {
      return res.status(400).json({ error: "Sana formati noto‘g‘ri. YYYY-MM-DD formatida kiriting" });
    }

    const newPayment: Payment = {
      id: nextPaymentId++,
      student_id: student.id,
      amount: parsedAmount,
      date: String(date),
      payment_method: payment_method ? String(payment_method) : "Payme",
      note: note ? String(note) : undefined,
      created_at: new Date().toISOString()
    };

    payments.push(newPayment);

    // Compute updated debtor status for this student's payment month
    const paymentMonth = newPayment.date.slice(0, 7);
    const monthPayments = payments.filter(p => p.student_id === student.id && p.date.startsWith(paymentMonth));
    const totalPaidInMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingDebt = Math.max(0, student.monthly_fee - totalPaidInMonth);

    const eventPayload = {
      payment: newPayment,
      student: {
        id: student.id,
        name: student.name,
        group: student.group
      },
      month: paymentMonth,
      total_paid: totalPaidInMonth,
      remaining_debt: remainingDebt
    };

    broadcast('PAYMENT_ADDED', eventPayload);

    return res.status(201).json({
      ...newPayment,
      student_name: student.name,
      student_group: student.group,
      remaining_debt: remainingDebt
    });
  });

  // 2. Muayyan o‘quvchining to‘lovlari ro‘yxatini olish: GET /api/students/:id/payments
  app.get('/api/students/:id/payments', (req: Request, res: Response): any => {
    const studentId = Number(req.params.id);
    const student = students.find(s => s.id === studentId);

    if (!student) {
      return res.status(404).json({ error: "O‘quvchi topilmadi" });
    }

    const studentPayments = payments
      .filter(p => p.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);

    return res.json({
      student,
      total_paid: totalPaid,
      payments: studentPayments
    });
  });

  // Barcha to'lovlar ro'yxatini olish: GET /api/payments
  app.get('/api/payments', (req: Request, res: Response) => {
    const { student_id, month } = req.query;
    let list = [...payments];

    if (student_id) {
      list = list.filter(p => p.student_id === Number(student_id));
    }

    if (month && typeof month === 'string') {
      list = list.filter(p => p.date.startsWith(month));
    }

    // Enrich with student info
    const enriched = list
      .map(p => {
        const student = students.find(s => s.id === p.student_id);
        return {
          ...p,
          student_name: student?.name || "Noma'lum",
          student_group: student?.group || "Noma'lum",
          student_phone: student?.phone || ""
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(enriched);
  });

  // 3-QISM: Bir oy uchun qarzdorlar so‘rovi: GET /debtors?month=YYYY-MM
  // Spec specifies GET /debtors?month=YYYY-MM, we also support /api/debtors?month=YYYY-MM
  const debtorsHandler = (req: Request, res: Response): any => {
    const month = req.query.month as string;

    if (!month) {
      return res.status(400).json({
        error: "month parametri majburiy (format: YYYY-MM, masalan: /debtors?month=2026-10)"
      });
    }

    // Validate YYYY-MM format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        error: "Noto‘g‘ri oy formati. YYYY-MM formatida bo‘lishi lozim (masalan: 2026-10)"
      });
    }

    // Find debtors for this month:
    // A student is a debtor if total payments in this month < monthly_fee
    const debtorsList = [];
    let totalDebtSum = 0;

    for (const student of students) {
      // Find all payments made by this student in the given month
      const studentMonthPayments = payments.filter(
        p => p.student_id === student.id && p.date.startsWith(month)
      );

      const paidAmount = studentMonthPayments.reduce((acc, p) => acc + p.amount, 0);

      if (paidAmount < student.monthly_fee) {
        const debtAmount = student.monthly_fee - paidAmount;
        totalDebtSum += debtAmount;

        debtorsList.push({
          id: student.id,
          name: student.name,
          phone: student.phone,
          group: student.group,
          monthly_fee: student.monthly_fee,
          paid_amount: paidAmount,
          debt_amount: debtAmount,
          payment_count: studentMonthPayments.length
        });
      }
    }

    // Sort debtors by largest debt first
    debtorsList.sort((a, b) => b.debt_amount - a.debt_amount);

    return res.json({
      month,
      total_students: students.length,
      debtor_count: debtorsList.length,
      total_debt: totalDebtSum,
      debtors: debtorsList
    });
  };

  app.get('/debtors', debtorsHandler);
  app.get('/api/debtors', debtorsHandler);

  // Summary stats endpoint
  app.get('/api/stats', (req: Request, res: Response) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayments = payments.filter(p => p.date.startsWith(currentMonth));
    const totalCollected = monthPayments.reduce((acc, p) => acc + p.amount, 0);

    let totalDebt = 0;
    let debtorCount = 0;

    for (const student of students) {
      const sp = monthPayments.filter(p => p.student_id === student.id);
      const paid = sp.reduce((acc, p) => acc + p.amount, 0);
      if (paid < student.monthly_fee) {
        debtorCount++;
        totalDebt += (student.monthly_fee - paid);
      }
    }

    res.json({
      current_month: currentMonth,
      total_students: students.length,
      debtor_count: debtorCount,
      total_debt: totalDebt,
      total_collected: totalCollected,
      total_payments_count: payments.length
    });
  });

  // Deep Analytics and Reporting endpoint: GET /api/analytics?year=YYYY
  app.get('/api/analytics', (req: Request, res: Response) => {
    const targetYear = (req.query.year as string) || new Date().getFullYear().toString();
    const monthNames = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"
    ];

    const currentFullMonth = new Date().toISOString().slice(0, 7);

    // Calculate monthly reports for 12 months of the target year
    const monthlyReports = [];
    let yearTotalRevenue = 0;
    let yearTotalDebt = 0;

    for (let m = 1; m <= 12; m++) {
      const monthStr = `${targetYear}-${String(m).padStart(2, '0')}`;
      const monthPayments = payments.filter(p => p.date.startsWith(monthStr));
      const collected = monthPayments.reduce((acc, p) => acc + p.amount, 0);

      // Only count students who were active/created by or in this month
      let monthDebt = 0;
      let monthDebtors = 0;
      let expectedMonthly = 0;

      for (const student of students) {
        expectedMonthly += student.monthly_fee;
        const studentPaid = monthPayments
          .filter(p => p.student_id === student.id)
          .reduce((acc, p) => acc + p.amount, 0);

        if (studentPaid < student.monthly_fee) {
          monthDebtors++;
          monthDebt += (student.monthly_fee - studentPaid);
        }
      }

      yearTotalRevenue += collected;
      if (monthStr <= currentFullMonth) {
        yearTotalDebt += monthDebt;
      }

      const totalTarget = collected + monthDebt;
      const collectionRate = totalTarget > 0 ? Math.round((collected / totalTarget) * 100) : 0;

      monthlyReports.push({
        month: monthStr,
        month_name: monthNames[m - 1],
        month_index: m,
        collected,
        payments_count: monthPayments.length,
        debt: monthDebt,
        debtor_count: monthDebtors,
        expected: expectedMonthly,
        collection_rate: collectionRate,
        is_future: monthStr > currentFullMonth
      });
    }

    // Group analytics
    const groups = Array.from(new Set(students.map(s => s.group))).filter(Boolean);
    const groupAnalytics = groups.map(grp => {
      const grpStudents = students.filter(s => s.group === grp);
      const studentIds = new Set(grpStudents.map(s => s.id));
      const grpPayments = payments.filter(p => studentIds.has(p.student_id) && p.date.startsWith(targetYear));
      const collected = grpPayments.reduce((acc, p) => acc + p.amount, 0);
      const monthlyExpected = grpStudents.reduce((acc, s) => acc + s.monthly_fee, 0);

      // Current month debt
      let currentDebt = 0;
      for (const st of grpStudents) {
        const paidThisMonth = payments
          .filter(p => p.student_id === st.id && p.date.startsWith(currentFullMonth))
          .reduce((acc, p) => acc + p.amount, 0);
        if (paidThisMonth < st.monthly_fee) {
          currentDebt += (st.monthly_fee - paidThisMonth);
        }
      }

      const rate = monthlyExpected > 0 ? Math.min(100, Math.round(((monthlyExpected - currentDebt) / monthlyExpected) * 100)) : 100;

      return {
        group: grp,
        students_count: grpStudents.length,
        total_collected: collected,
        monthly_expected: monthlyExpected,
        current_debt: currentDebt,
        discipline_rate: Math.max(0, rate)
      };
    });

    // Payment methods breakdown
    const yearPayments = payments.filter(p => p.date.startsWith(targetYear));
    const methodMap = new Map<string, { amount: number; count: number }>();

    for (const p of yearPayments) {
      const method = p.payment_method || 'Boshqa';
      const cur = methodMap.get(method) || { amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += 1;
      methodMap.set(method, cur);
    }

    const totalMethodsAmount = Array.from(methodMap.values()).reduce((sum, item) => sum + item.amount, 0);
    const paymentMethods = Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalMethodsAmount > 0 ? Math.round((data.amount / totalMethodsAmount) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Active months count
    const activeMonths = monthlyReports.filter(m => !m.is_future && (m.collected > 0 || m.debt > 0));
    const avgMonthly = activeMonths.length > 0 ? Math.round(yearTotalRevenue / activeMonths.length) : 0;
    const highestMonth = [...monthlyReports].sort((a, b) => b.collected - a.collected)[0];

    const overallCollectionRate = (yearTotalRevenue + yearTotalDebt) > 0
      ? Math.round((yearTotalRevenue / (yearTotalRevenue + yearTotalDebt)) * 100)
      : 0;

    res.json({
      year: targetYear,
      monthly_reports: monthlyReports,
      group_analytics: groupAnalytics,
      payment_methods: paymentMethods,
      summary: {
        total_year_revenue: yearTotalRevenue,
        total_year_debt: yearTotalDebt,
        average_monthly_revenue: avgMonthly,
        highest_month_name: highestMonth?.month_name || "Noma'lum",
        highest_month_amount: highestMonth?.collected || 0,
        total_payments_count: yearPayments.length,
        overall_collection_rate: overallCollectionRate,
        total_students: students.length
      }
    });
  });

  // Mount Vite middleware for React SPA in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EduPay Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 WebSocket server is active on the same port`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
