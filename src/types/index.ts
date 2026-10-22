export interface Student {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthly_fee: number;
  created_at?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  student_name?: string;
  student_group?: string;
  student_phone?: string;
  amount: number;
  date: string;
  payment_method?: string;
  note?: string;
  created_at?: string;
  remaining_debt?: number;
}

export interface Debtor {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthly_fee: number;
  paid_amount: number;
  debt_amount: number;
  payment_count: number;
}

export interface DebtorsResponse {
  month: string;
  total_students: number;
  debtor_count: number;
  total_debt: number;
  debtors: Debtor[];
}

export interface StatsResponse {
  current_month: string;
  total_students: number;
  debtor_count: number;
  total_debt: number;
  total_collected: number;
  total_payments_count: number;
}

export interface WebSocketEvent {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

export interface MonthlyReport {
  month: string;
  month_name: string;
  month_index: number;
  collected: number;
  payments_count: number;
  debt: number;
  debtor_count: number;
  expected: number;
  collection_rate: number;
  is_future: boolean;
}

export interface GroupAnalytics {
  group: string;
  students_count: number;
  total_collected: number;
  monthly_expected: number;
  current_debt: number;
  discipline_rate: number;
}

export interface PaymentMethodStat {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  total_year_revenue: number;
  total_year_debt: number;
  average_monthly_revenue: number;
  highest_month_name: string;
  highest_month_amount: number;
  total_payments_count: number;
  overall_collection_rate: number;
  total_students: number;
}

export interface AnalyticsResponse {
  year: string;
  monthly_reports: MonthlyReport[];
  group_analytics: GroupAnalytics[];
  payment_methods: PaymentMethodStat[];
  summary: AnalyticsSummary;
}
