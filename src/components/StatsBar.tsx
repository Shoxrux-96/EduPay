import React from 'react';
import { Users, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatsResponse } from '../types';

interface StatsBarProps {
  stats: StatsResponse | null;
  loading: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, loading }) => {
  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const items = [
    {
      title: "Jami o'quvchilar",
      value: stats?.total_students ?? 0,
      format: (v: number) => v.toString(),
      icon: Users,
      color: "text-slate-700",
      description: "Tizimda ro'yxatdan o'tgan"
    },
    {
      title: "Qarzdorlar soni",
      value: stats?.debtor_count ?? 0,
      format: (v: number) => `${v} nafar`,
      icon: AlertTriangle,
      color: "text-rose-600",
      description: "To'lov muddati kechikkan"
    },
    {
      title: "Umumiy qarz summasi",
      value: stats?.total_debt ?? 0,
      format: formatUZS,
      icon: TrendingUp,
      color: "text-rose-600",
      description: "Joriy oy bo'yicha yig'ilishi kerak"
    },
    {
      title: "Joriy oy tushumi",
      value: stats?.total_collected ?? 0,
      format: formatUZS,
      icon: CheckCircle2,
      color: "text-emerald-600",
      description: "Muvaffaqiyatli qabul qilingan"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white border border-slate-200/90 rounded-xl transition-all hover:border-slate-300 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {item.title}
              </span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {loading ? (
                <div className="h-7 w-24 bg-slate-100 animate-pulse rounded" />
              ) : (
                item.format(item.value)
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
