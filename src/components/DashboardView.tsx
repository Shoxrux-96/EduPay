import React, { useState, useEffect } from 'react';
import { AnalyticsResponse } from '../types';
import { api } from '../services/api';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  RefreshCw,
  BarChart3,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Download
} from 'lucide-react';

interface DashboardViewProps {
  refreshTrigger: number;
  onOpenPaymentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  refreshTrigger,
  onOpenPaymentModal,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'past' | 'debtors'>('all');

  const fetchAnalytics = async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics(year);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Tahliliy ma‘lumotlarni yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedYear);
  }, [selectedYear, refreshTrigger]);

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  // Max value for bar scaling in the chart
  const maxMonthlyVal = Math.max(
    ...(data?.monthly_reports.map((m) => Math.max(m.collected, m.debt)) || [1000000])
  );

  const filteredReports = (data?.monthly_reports || []).filter((m) => {
    if (activeTabFilter === 'past') return !m.is_future;
    if (activeTabFilter === 'debtors') return m.debt > 0;
    return true;
  });

  const handleExportCSV = () => {
    if (!data) return;
    const headers = "Oy,Tushum (som),Qarz (som),Tolovlar soni,Qarzdorlar soni,Yigim foizi\n";
    const rows = data.monthly_reports.map((m) =>
      `"${m.month_name} (${m.month})",${m.collected},${m.debt},${m.payments_count},${m.debtor_count},${m.collection_rate}%`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduPay_Hisobot_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Time Filter */}
      <div className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Moliya va Qarzdorlik Tahlili (Dashboard)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Oyma-oy va yillik tushumlar, qarzdorlik dinamikasi, guruhlar statistikasi va chuqur tahlil
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <label htmlFor="year-select" className="text-xs font-semibold text-slate-600">
                Yil:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-hidden cursor-pointer font-mono"
              >
                <option value="2026">2026-yil</option>
                <option value="2025">2025-yil</option>
                <option value="2024">2024-yil</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-xs"
              title="CSV eksport"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eksport CSV</span>
            </button>

            <button
              onClick={() => fetchAnalytics(selectedYear)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>{selectedYear} Yillik Jami Tushum</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {loading ? '...' : formatUZS(data?.summary.total_year_revenue ?? 0)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600 font-mono">
              {data?.summary.total_payments_count ?? 0} ta
            </span>
            <span>to'lov tranzaksiyasi qabul qilindi</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Joriy Qarzlar Summasi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {loading ? '...' : formatUZS(data?.summary.total_year_debt ?? 0)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Yig'im intizomi:</span>
            <span className="font-bold font-mono text-slate-900">
              {data?.summary.overall_collection_rate ?? 0}%
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Oylik O'rtacha Tushum</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {loading ? '...' : formatUZS(data?.summary.average_monthly_revenue ?? 0)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Faol oylar bo'yicha hisoblangan
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Eng Daromadli Oy</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {loading ? '...' : data?.summary.highest_month_name}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono">
            Tushum: <strong className="text-emerald-600 font-semibold">{formatUZS(data?.summary.highest_month_amount ?? 0)}</strong>
          </div>
        </div>
      </div>

      {/* Main Visual Diagram: Monthly Revenue vs Debt Chart */}
      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Oyma-oy to'lovlar va qarzdorlik taqqoslash diagrammasi</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Yashil ustun: To'langan tushum | Qizil ustun: Qolgan qarz miqdori ({selectedYear})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              Tushum
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              Qarz
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-4 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-12 gap-3 items-end h-56 pt-6 pb-2 border-b border-slate-200">
              {(data?.monthly_reports || []).map((m) => {
                const revenueHeight = maxMonthlyVal > 0 ? (m.collected / maxMonthlyVal) * 100 : 0;
                const debtHeight = maxMonthlyVal > 0 ? (m.debt / maxMonthlyVal) * 100 : 0;

                return (
                  <div key={m.month} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] rounded-lg p-2.5 shadow-xl pointer-events-none whitespace-nowrap z-20 font-mono">
                      <p className="font-bold text-slate-200">{m.month_name} ({m.month})</p>
                      <p className="text-emerald-400 mt-0.5">Tushum: {formatUZS(m.collected)}</p>
                      <p className="text-rose-400">Qarz: {formatUZS(m.debt)}</p>
                      <p className="text-slate-300 mt-0.5">Yig'im darajasi: {m.collection_rate}%</p>
                      <p className="text-slate-400">To'lovlar soni: {m.payments_count} ta</p>
                    </div>

                    {/* Dual bar columns */}
                    <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                      {/* Revenue Bar */}
                      <div
                        style={{ height: `${Math.max(revenueHeight, 4)}%` }}
                        className={`w-1/2 rounded-t-xs transition-all duration-300 ${
                          m.collected > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-100'
                        }`}
                      />
                      {/* Debt Bar */}
                      <div
                        style={{ height: `${Math.max(debtHeight, 4)}%` }}
                        className={`w-1/2 rounded-t-xs transition-all duration-300 ${
                          m.debt > 0 ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-slate-100'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="grid grid-cols-12 gap-3 pt-2 text-center text-xs font-semibold text-slate-600">
              {(data?.monthly_reports || []).map((m) => (
                <div key={m.month} className="truncate">
                  <span className="block text-[11px]">{m.month_name.slice(0, 3)}</span>
                  <span className="block text-[10px] font-mono text-slate-400">
                    {m.collection_rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Group Analytics & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Group Performance Analysis */}
        <div className="lg:col-span-7 bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Guruhlar kesimida to'lov intizomi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Har bir guruhdagi o'quvchilar soni, tushum va qarzlar
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {(data?.group_analytics || []).map((grp) => (
              <div key={grp.group} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{grp.group}</h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {grp.students_count} ta o'quvchi · Oylik reja: {formatUZS(grp.monthly_expected)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block tabular-nums">
                      {formatUZS(grp.total_collected)}
                    </span>
                    {grp.current_debt > 0 ? (
                      <span className="text-[11px] font-mono text-rose-600 font-semibold">
                        Qarz: {formatUZS(grp.current_debt)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                        Qarz yo'q ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                    <span>To'lov intizomi</span>
                    <span className="font-mono font-bold text-slate-800">{grp.discipline_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        grp.discipline_rate >= 80
                          ? 'bg-emerald-500'
                          : grp.discipline_rate >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, grp.discipline_rate)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Payment Methods Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>To'lov usullari taqsimoti</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Qabul qilingan to'lovlarning to'lov kanallari bo'yicha ulushi
            </p>
          </div>

          <div className="space-y-3">
            {(data?.payment_methods || []).map((method) => (
              <div key={method.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    {method.method}
                  </span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {formatUZS(method.amount)}{' '}
                    <span className="text-slate-400 font-normal">({method.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right font-mono">
                  {method.count} ta to'lov operatsiyasi
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Monthly Report Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Batafsil Oyma-oy Hisobot Jurnali ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Har bir oy uchun tushum, qarz miqdori, tranzaksiyalar va yig'im samaradorligi
            </p>
          </div>

          {/* Table quick filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTabFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barcha oylar (12)
            </button>
            <button
              onClick={() => setActiveTabFilter('past')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTabFilter === 'past'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              O'tgan va joriy
            </button>
            <button
              onClick={() => setActiveTabFilter('debtors')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTabFilter === 'debtors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Qarzi bor oylar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Oy</th>
                <th className="py-3 px-4 text-right">Tushum</th>
                <th className="py-3 px-4 text-right">Qarz summasi</th>
                <th className="py-3 px-4 text-center">To'lovlar</th>
                <th className="py-3 px-4 text-center">Qarzdorlar</th>
                <th className="py-3 px-4 text-center">Yig'im samaradorligi</th>
                <th className="py-3 px-4 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredReports.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                    <div>{m.month_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{m.month}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">
                    {formatUZS(m.collected)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 tabular-nums">
                    {formatUZS(m.debt)}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {m.payments_count} ta
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700">
                    {m.debtor_count > 0 ? (
                      <span className="text-rose-600 font-bold">{m.debtor_count} nafar</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            m.collection_rate >= 80
                              ? 'bg-emerald-500'
                              : m.collection_rate >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${m.collection_rate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{m.collection_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {m.is_future ? (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Kelgusi
                      </span>
                    ) : m.debt === 0 && m.collected > 0 ? (
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        To'liq yopilgan
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Faol hisob
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
