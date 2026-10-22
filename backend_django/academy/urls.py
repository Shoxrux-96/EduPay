from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, PaymentViewSet, DebtorsAPIView, StatsAPIView, AnalyticsAPIView

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('debtors/', DebtorsAPIView.as_view(), name='debtors'),
    path('stats/', StatsAPIView.as_view(), name='stats'),
    path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),
]
