import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  FolderOpen,
  Send,
  Zap,
  Info
} from 'lucide-react';

interface EndpointSpec {
  id: string;
  category: 'Qarzdorlar' | "O'quvchilar" | "To'lovlar" | 'Tahlil va Statistika' | 'WebSocket';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WS';
  path: string;
  title: string;
  description: string;
  params?: Array<{ name: string; type: string; defaultVal: string; description: string }>;
  sampleBody?: string;
  queryParams?: Record<string, string>;
}

export const ApiExplorer: React.FC = () => {
  const endpoints: EndpointSpec[] = [
    // 1. Qarzdorlar
    {
      id: 'debtors-month',
      category: 'Qarzdorlar',
      method: 'GET',
      path: '/debtors?month={month}',
      title: '1-qism 3: Bir oy uchun qarzdorlar so‘rovi',
      description: 'Oylik to‘lov summasidan kam to‘lagan o‘quvchilarni va ularning qancha qarzi borligini qaytaradi.',
      params: [{ name: 'month', type: 'string', defaultVal: '2026-10', description: 'YYYY-MM formatidagi oy filtri' }]
    },
    {
      id: 'debtors-api-month',
      category: 'Qarzdorlar',
      method: 'GET',
      path: '/api/debtors?month={month}',
      title: 'Qarzdorlar API muqobil yo‘nalishi',
      description: 'Qarzdorlar so‘rovining /api/ prefiksi bilan ishlovchi varianti.',
      params: [{ name: 'month', type: 'string', defaultVal: '2026-10', description: 'YYYY-MM formatidagi oy' }]
    },

    // 2. O'quvchilar
    {
      id: 'students-list',
      category: "O'quvchilar",
      method: 'GET',
      path: '/api/students',
      title: '1-qism 1.2: O‘quvchilar ro‘yxatini olish',
      description: 'Barcha faol o‘quvchilar ro‘yxati (qidiruv va guruh bo‘yicha filtrlar bilan).',
    },
    {
      id: 'students-create',
      category: "O'quvchilar",
      method: 'POST',
      path: '/api/students',
      title: '1-qism 1.1: Yangi o‘quvchi qo‘shish',
      description: 'Yangi o‘quvchini tizimga kiritadi va WebSocket orqali STUDENT_CREATED hodisasini tarqatadi.',
      sampleBody: JSON.stringify(
        {
          name: "Temur Mahmudov",
          phone: "+998 90 777 66 55",
          group: "Fullstack Ecomdev (EC-303)",
          monthly_fee: 1800000
        },
        null,
        2
      )
    },
    {
      id: 'students-update',
      category: "O'quvchilar",
      method: 'PUT',
      path: '/api/students/{id}',
      title: '1-qism 1.3: O‘quvchi ma’lumotlarini o‘zgartirish',
      description: 'Muayyan ID dagi o‘quvchi ma’lumotlarini yangilash (STUDENT_UPDATED hodisasi yuboriladi).',
      params: [{ name: 'id', type: 'number', defaultVal: '2', description: 'O‘quvchi ID raqami' }],
      sampleBody: JSON.stringify(
        {
          name: "Zulayho Karimova",
          phone: "+998 93 987 65 43",
          group: "Python Django (PY-202)",
          monthly_fee: 1600000
        },
        null,
        2
      )
    },
    {
      id: 'students-delete',
      category: "O'quvchilar",
      method: 'DELETE',
      path: '/api/students/{id}',
      title: '1-qism 1.4: O‘quvchini o‘chirish',
      description: 'O‘quvchini tizimdan o‘chirish va STUDENT_DELETED hodisasini tarqatish.',
      params: [{ name: 'id', type: 'number', defaultVal: '6', description: 'O‘quvchi ID raqami' }]
    },
    {
      id: 'students-history',
      category: "O'quvchilar",
      method: 'GET',
      path: '/api/students/{id}/payments',
      title: '1-qism 2.2: Muayyan o‘quvchining to‘lovlari ro‘yxati',
      description: 'Belgilangan o‘quvchi tomonidan amalga oshirilgan barcha to‘lovlar va to‘langan jami summa.',
      params: [{ name: 'id', type: 'number', defaultVal: '2', description: 'O‘quvchi ID raqami' }]
    },

    // 3. To'lovlar
    {
      id: 'payments-list',
      category: "To'lovlar",
      method: 'GET',
      path: '/api/payments',
      title: '1-qism 2: Barcha to‘lovlar ro‘yxati',
      description: 'Tizimdagi barcha to‘lov tranzaksiyalari (oy yoki student_id bo‘yicha saralash mumkin).',
    },
    {
      id: 'payments-create',
      category: "To'lovlar",
      method: 'POST',
      path: '/api/payments',
      title: '1-qism 2.1: Yangi to‘lov kiritish',
      description: 'O‘quvchi to‘lovini qabul qilish, balansni qayta hisoblash va PAYMENT_ADDED hodisasini yuborish.',
      sampleBody: JSON.stringify(
        {
          student_id: 2,
          amount: 500000,
          date: new Date().toISOString().split('T')[0],
          payment_method: "Payme",
          note: "Qarzdorlikni to‘liq yopish"
        },
        null,
        2
      )
    },

    // 4. Tahlil va Statistika
    {
      id: 'analytics-year',
      category: 'Tahlil va Statistika',
      method: 'GET',
      path: '/api/analytics?year={year}',
      title: 'Yillik va oyma-oy chuqur tahlil API',
      description: 'Oyma-oy tushum va qarzlar dinamikasi, guruhlar statistikasi va to‘lov usullari ulushi.',
      params: [{ name: 'year', type: 'string', defaultVal: '2026', description: 'Hisobot yili (YYYY)' }]
    },
    {
      id: 'stats-summary',
      category: 'Tahlil va Statistika',
      method: 'GET',
      path: '/api/stats',
      title: 'Umumiy boshqaruv paneli ko‘rsatkichlari',
      description: 'Jami o‘quvchilar soni, joriy oy tushumi va umumiy qarzdorlik qoldig‘i.',
    },

    // 5. WebSocket
    {
      id: 'ws-realtime',
      category: 'WebSocket',
      method: 'WS',
      path: 'ws://localhost:3000 (yoki wss://)',
      title: 'Real-Time WebSocket hodisalari',
      description: 'Serverdan avtomatik tarqatiladigan hodisalar: PAYMENT_ADDED, STUDENT_CREATED, STUDENT_UPDATED, STUDENT_DELETED.',
      sampleBody: JSON.stringify(
        {
          type: "PAYMENT_ADDED",
          data: {
            payment: { id: 10, student_id: 2, amount: 500000, date: "2026-10-21" },
            student: { id: 2, name: "Zulayho Karimova", group: "Python Django" },
            month: "2026-10",
            total_paid: 1500000,
            remaining_debt: 0
          },
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    }
  ];

  const [activeEndpointId, setActiveEndpointId] = useState<string>('debtors-month');
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    month: '2026-10',
    id: '2',
    year: '2026'
  });
  const [requestBody, setRequestBody] = useState<string>('');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const current = endpoints.find(e => e.id === activeEndpointId) || endpoints[0];

  const handleSelectEndpoint = (ep: EndpointSpec) => {
    setActiveEndpointId(ep.id);
    setResponseOutput(null);
    setStatusCode(null);
    setExecutionTime(null);
    if (ep.sampleBody) {
      setRequestBody(ep.sampleBody);
    } else {
      setRequestBody('');
    }
  };

  const handleParamChange = (name: string, val: string) => {
    setParamValues(prev => ({ ...prev, [name]: val }));
  };

  const handleExecute = async () => {
    if (current.method === 'WS') {
      setResponseOutput(
        JSON.stringify(
          {
            info: "WebSocket ulanishi faol. Real-time hodisalarni qabul qilish uchun hook orqali doimiy ochiq kanal ishlamoqda.",
            events_supported: [
              "PAYMENT_ADDED",
              "STUDENT_CREATED",
              "STUDENT_UPDATED",
              "STUDENT_DELETED"
            ],
            sample_payload: JSON.parse(current.sampleBody || '{}')
          },
          null,
          2
        )
      );
      setStatusCode(101);
      return;
    }

    setLoading(true);
    setResponseOutput(null);
    setStatusCode(null);
    setExecutionTime(null);

    let url = current.path;
    // Replace all placeholders like {month}, {id}, {year}
    for (const [k, v] of Object.entries(paramValues)) {
      url = url.replace(`{${k}}`, encodeURIComponent(v));
    }

    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method: current.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (['POST', 'PUT'].includes(current.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const timeMs = Math.round(performance.now() - startTime);
      setExecutionTime(timeMs);
      setStatusCode(res.status);
      const data = await res.json().catch(() => ({ status: 'Non-JSON response' }));
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatusCode(500);
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (responseOutput) {
      navigator.clipboard.writeText(responseOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POST': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PUT': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WS': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const categories = ['all', 'Qarzdorlar', "O'quvchilar", "To'lovlar", 'Tahlil va Statistika', 'WebSocket'];
  const filteredEndpoints = selectedCategory === 'all'
    ? endpoints
    : endpoints.filter(e => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 border border-slate-200/90 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                API Explorer & Hujjatlar
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Test topshirig'ida talab etilgan barcha REST API va WebSocket xizmatlarini jonli sinovdan o'tkazish
              </p>
            </div>
          </div>

          {/* Category filter select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Bo'lim:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Barcha APIlar ({endpoints.length})</option>
              <option value="Qarzdorlar">Qarzdorlar</option>
              <option value="O'quvchilar">O'quvchilar (CRUD)</option>
              <option value="To'lovlar">To'lovlar</option>
              <option value="Tahlil va Statistika">Tahlil va Statistika</option>
              <option value="WebSocket">WebSocket</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API List with Category Groups */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 max-h-[720px] overflow-y-auto">
          <div className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Mavjud Endpointlar ({filteredEndpoints.length})
          </div>

          {filteredEndpoints.map((ep) => {
            const isSelected = activeEndpointId === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-900 truncate">
                    {ep.path}
                  </span>
                </div>
                <div className="text-[12px] font-medium text-slate-700 truncate">
                  {ep.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>{ep.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Interactive Tester & Payload Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${getMethodColor(
                    current.method
                  )}`}
                >
                  {current.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {current.path}
                </span>
              </div>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg transition-all shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{loading ? "Yuborilmoqda..." : "So'rov yuborish"}</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {current.description}
            </p>

            {/* Parameters Inputs */}
            {current.params && current.params.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  So'rov Parametrlari (URL Params)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.params.map((p) => (
                    <div key={p.name}>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        <code>{`{${p.name}}`}</code> — {p.description}:
                      </label>
                      <input
                        type="text"
                        value={paramValues[p.name] ?? p.defaultVal}
                        onChange={(e) => handleParamChange(p.name, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body Editor for POST / PUT */}
            {['POST', 'PUT'].includes(current.method) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Request JSON Body:
                  </span>
                  <button
                    type="button"
                    onClick={() => setRequestBody(current.sampleBody || '')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Boshlang'ich qiymatni tiklash
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Server Response Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Server Javobi (Response):
                  </span>
                  {statusCode !== null && (
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        statusCode < 300
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Status: {statusCode} {statusCode === 101 ? 'Switching Protocols (WS)' : ''}
                    </span>
                  )}
                  {executionTime !== null && (
                    <span className="text-[11px] font-mono text-slate-400">
                      ({executionTime} ms)
                    </span>
                  )}
                </div>

                {responseOutput && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-88 shadow-inner border border-slate-900">
                {loading ? (
                  <div className="text-slate-400 animate-pulse flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                    <span>Serverga so'rov yuborilmoqda va javob kutilmoqda...</span>
                  </div>
                ) : responseOutput ? (
                  <pre>{responseOutput}</pre>
                ) : (
                  <div className="text-slate-500 italic">
                    "So'rov yuborish" tugmasini bosing va serverdan qaytgan JSON natijani ko'ring...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
