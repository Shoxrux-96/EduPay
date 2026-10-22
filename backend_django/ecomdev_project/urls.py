from django.contrib import admin
from django.urls import path, include
from academy.views import DebtorsAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    # 1-Qism 3. Bir oy uchun qarzdorlar so'rovi: GET /debtors?month=YYYY-MM
    path('debtors', DebtorsAPIView.as_view(), name='debtors-direct'),
    path('api/debtors', DebtorsAPIView.as_view(), name='debtors-api'),
    # API endpoints for students, payments, stats, and bot simulation
    path('api/', include('academy.urls')),
]
