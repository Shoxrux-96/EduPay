# EduPay — O'quvchilar va To'lovlar Boshqaruvi Tizimi

Ushbu loyiha **Ecomdev** kompaniyasi dasturchisi vakansiyasi uchun topshirilgan test vazifasining to'liq va mukammal yechimidir.

Loyiha arxitekturasi:
- **Frontend**: React 19 (TypeScript), Tailwind CSS v4, Lucide Icons, Mobile-first responsive UI.
- **Backend (Ishlayotgan Live Server)**: Node.js / Express (TypeScript) + WebSocket (`ws`), REST API va Real-time broadcast.
- **Backend (Django loyihasi)**: `/backend_django` katalogida joylashgan to'liq Django 5 + Django REST Framework + Django Channels (WebSocket) arxitekturasi.
- **Real-time texnologiya**: Har bir to'lov, yangi o'quvchi yoki balans o'zgarishi darhol WebSocket orqali barcha ulangan foydalanuvchilar ekranida sahifani yangilamasdan aks etadi.

---

## 1-Qism. API Spetsifikatsiyasi

### 1. O‘quvchilar (Students)
- `POST /api/students` — Yangi o‘quvchi qo‘shish
  - Body: `{"name": "string", "phone": "string", "group": "string", "monthly_fee": number}`
- `GET /api/students` — O‘quvchilar ro‘yxatini olish (qidiruv va guruh bo‘yicha filtr bilan)
- `PUT /api/students/:id` — O‘quvchi ma’lumotlarini o‘zgartirish
- `DELETE /api/students/:id` — O‘quvchini tizimdan o‘chirish
- `GET /api/students/:id/payments` — Muayyan o‘quvchining to‘lovlari ro‘yxati va jami to‘langan summa

### 2. To‘lovlar (Payments)
- `POST /api/payments` — To‘lov qo‘shish
  - Body: `{"student_id": number, "amount": number, "date": "YYYY-MM-DD", "payment_method": "string", "note": "string"}`
- `GET /api/payments` — Barcha to‘lovlar ro‘yxati (oy yoki o‘quvchi bo‘yicha filtrlash mumkin)

- `GET /debtors?month=YYYY-MM` (shuningdek `GET /api/debtors?month=YYYY-MM`)
  - Ushbu oyda oylik to‘lov summasidan kam to‘lagan barcha o‘quvchilar va ularning aniq qolgan qarzini (`monthly_fee - paid_amount`) hisoblab qaytaradi.

### 4. Tahlil va Yillik/Oylik Hisobotlar (Analytics)
- `GET /api/analytics?year=YYYY`
  - Tanlangan yil uchun 12 oylik to‘lovlar va qarzdorlik dinamikasi, guruhlar kesimidagi samaradorlik, to‘lov usullari statistikasi va umumiy xulosalarni qaytaradi.
- `GET /api/stats` — Tizimning umumiy joriy metriklari (jami o‘quvchilar, tushum, qarz).

  - Namuna javob:
  ```json
  {
    "month": "2026-10",
    "total_students": 6,
    "debtor_count": 2,
    "total_debt": 1500000,
    "debtors": [
      {
        "id": 4,
        "name": "Madina Rahimova",
        "phone": "+998 91 333 22 11",
        "group": "Fullstack Ecomdev (EC-303)",
        "monthly_fee": 1800000,
        "paid_amount": 800000,
        "debt_amount": 1000000,
        "payment_count": 1
      },
      {
        "id": 2,
        "name": "Zulayho Karimova",
        "phone": "+998 93 987 65 43",
        "group": "Python Django (PY-202)",
        "monthly_fee": 1500000,
        "paid_amount": 1000000,
        "debt_amount": 500000,
        "payment_count": 1
      }
    ]
  }
  ```

---

## 2-Qism. Interfeys (B varianti — Veb-sahifa)

Platforma to'liq veb-sahifa (SaaS Dashboard) ko'rinishida ishlab chiqilgan va quyidagi imkoniyatlarni o'z ichiga oladi:
1. **Chap tomonlama Sidebar menyu**: Qarzdorlar, O'quvchilar, To'lov kiritish, To'lovlar tarixi, API Explorer, tezkor "+ To'lov qilish" tugmasi va WS Real-Time holat indikatori.
2. **Oylik qarzdorlar monitoringi**: Istalgan oy (`YYYY-MM`) bo'yicha qarzdorlar ro'yxatini ko'rish, qidiruv, umumiy qarz ko'rsatkichi va bir tugma orqali to'lov oynasini ochish.
3. **Qulay to'lov kiritish formasi**: O'quvchini qidiruv orqali tanlash, tezkor summa tugmalari (to'liq qarz, 500k, 1M va h.k.), sana, to'lov usuli va tranzaksiya chekini avtomatik chop etish/yuklab olish.
4. **O'quvchilar to'liq boshqaruvi (CRUD)**: Yangi o'quvchi qo'shish, ma'lumotlarni tahrirlash, o'chirish va ularning har birining shaxsiy to'lovlar tarixini ko'rish.
5. **Real-time WebSocket monitoringi**: Har bir yangi to'lov yoki o'quvchi qo'shilishi bilan barcha ochiq brauzerlarga jonli bildirishnoma (Toast) yuboriladi va jadvallar avtomatik qayta yangilanadi.
6. **Interaktiv API Explorer**: Hujjatlashtirilgan barcha endpointlarni brauzerdan sinab ko'rish vositasi.
7. **Mobil moslashuvchanlik**: Smartfon ekranlarida qulay bosh barmoq navigatsiyasi (Bottom Nav), teginish maydonlari $\ge 44$px va ixcham kartalar.

---

## 3-Qism. Loyihani noldan ishga tushirish bo‘yicha ko‘rsatmalar

### A) Node.js / React Fullstack loyihasini ishga tushirish (Hozirgi faol platforma)

1. **Repozitoriyani klonlash va papkaga kirish:**
   ```bash
   git clone <repo_url>
   cd <repo_folder>
   ```

2. **Kutubxonalarni o'rnatish:**
   ```bash
   npm install
   ```

3. **Dasturni dasturchi (development) rejimida ishga tushirish:**
   ```bash
   npm run dev
   ```
   Server `http://localhost:3000` portida ishga tushadi (Express backend + WebSocket server + React Vite SPA).

4. **Production uchun yig'ish va ishga tushirish:**
   ```bash
   npm run build
   npm start
   ```

---

### B) Django + Channels Backend loyihasini ishga tushirish (`/backend_django`)

Agar backendni Django muhitida alohida ishga tushirmoqchi bo'lsangiz:

1. **Python virtual muhitini yaratish va faollashtirish:**
   ```bash
   cd backend_django
   python -m venv venv
   # Linux/macOS:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

2. **Kerakli kutubxonalarni o'rnatish:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ma'lumotlar bazasi migratsiyalarini bajarish:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Boshlang'ich test ma'lumotlarini yuklash (Seeding):**
   ```bash
   python manage.py seed_data
   ```

5. **ASGI serverni (Daphne / WebSockets qo'llab-quvvatlashi bilan) ishga tushirish:**
   ```bash
   python manage.py runserver 8000
   ```
   Django REST Framework API `http://localhost:8000/api/` manzilida, qarzdorlar so'rovi `http://localhost:8000/debtors?month=YYYY-MM`, WebSocket esa `ws://localhost:8000/ws/academy/` manzilida ishlaydi.

---

## 3-Qism. Agar yana 1 hafta vaqt bo'lganida, loyihani qanday yaxshilagan bo'lardim?

1. **To'lov tizimlari bilan to'g'ridan-to'g'ri fiskal integratsiya (Click Merchant, Payme Business, Uzum Bank)**:
   - Hozirgi kvitansiya kiritish o'rniga, o'quvchilarga maxsus to'lov havolasi yoki QR-kod shakllantirish, to'lov amalga oshirilganda webhook orqali o'quvchi balansini avtomatik to'ldirish va soliq fiskal cheklarini shakllantirish.

2. **SMS va Telegram orqali avtomatlashtirilgan eslatmalar (Cron Job & Webhook)**:
   - Har oyning belgilangan sanasida (masalan, har oyning 5-sanasida) Eskiz.uz SMS provayderi orqali ota-onalar va o'quvchilarga to'lov muddati haqida avtomatik shaxsiy eslatma yuborish tizimini joriy qilish.

3. **Ko'p oylik qarzlar va diskont/stipendiya hisobi (Advanced Ledger & Balance Rollover)**:
   - O'quvchi bir necha oy davomida to'lov qilmasa yoki aksincha oldindan 3 oylik to'lov qilsa, ortiqcha summani depozit sifatida saqlash va keyingi oylarga avtomatik hisoblash mexanizmini kiritish.

4. **Foydalanuvchi rollari va xavfsizlik (RBAC — Role-Based Access Control)**:
   - Tizimga "Super Admin", "Filial menejeri", "Kassir" va "O'qituvchi" rollarini qo'shish. O'qituvchi faqat o'z guruhidagi o'quvchilar davomati va to'lov holatini ko'ra oladi, kassir esa to'lovlarni qabul qiladi.

5. **PDF / Excel hisobotlar va tahliliy grafiklar (Analytics Dashboard)**:
   - Guruhlar bo'yicha tushum dinamikasi, oylik to'lovlar tahlili, qarzdorlik foizi va bir klik bilan oylik hisobotlarni Excel/PDF formatida yuklab olish imkoniyatini yaratish.

---

## 4-Qism. Sun’iy intellekt (AI) haqida bayonot

1. **Qaysi AI vositalaridan foydalandingiz va qaysi promptlar eng yaxshi natija berdi?**
   - Kodlash jarayonida Google AI Studio (Gemini 2.5 / 3.8 Flash) modelidan arxitektura dizayni, TypeScript interfeyslari hamda Django REST Framework + Channels sinflarini generatsiya qilishda foydalandim. Eng samarali promptlar — qat'iy API cheklovlari va bitta aniq vazifaga yo'naltirilgan so'rovlar bo'ldi (masalan: *"Yoziladigan GET /debtors?month=YYYY-MM endpointi berilgan oy uchun har bir o'quvchining to'lovlarini agregatsiya qilsin, monthly_fee dan kam bo'lganlarni saralab, debt_amount ni hisoblab chiqarsin"*).

2. **AI qayerda xato qildi? Bu xatoni qanday aniqladingiz va tuzatdingiz?**
   - AI dastlab qarzdorlarni hisoblashda oy bo'yicha filtrlashni e'tibordan chetda qoldirib, o'quvchining butun tarix davomidagi jami to'lovlarini umumlashtirib hisoblashga urindi, bu esa oldingi oylardagi to'lovlar hisobiga joriy oyda to'lamagan o'quvchini qarzdor emas deb chiqarishiga sabab bo'lardi. Xatoni test so'rovlari va mantiqiy kod tahlili jarayonida aniqladim hamda to'lov sanasining `YYYY-MM` qismini alohida tekshiruvchi aniq agregatsiya filtri bilan tuzatdim.

3. **Kodning qaysi qismini o‘zingiz yozdingiz, qaysi qismini esa AI yaratdi?**
   - Tizim arxitekturasi, ma'lumotlar bazasi sxemalari, WebSocket hodisalari protokoli, mobil UI mantiqiy qoidalari va xatoliklarni qayta ishlash ssenariylarini o'zim loyihalashtirdim va nazorat qildim; AI esa takrorlanuvchi shablon kodlar (DRF serializerlari, boilerplate routing, SVG belgilari va namunaviy seed ma'lumotlari)ni tezkor yaratishda yordam berdi.
