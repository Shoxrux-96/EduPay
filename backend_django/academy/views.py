import re
from datetime import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Student, Payment
from .serializers import StudentSerializer, PaymentSerializer, DebtorSerializer

def broadcast_ws(event_type, payload):
    """Utility to broadcast real-time events to all WebSocket clients."""
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                'academy_live_updates',
                {
                    'type': 'academy_event',
                    'event_type': event_type,
                    'payload': payload,
                }
            )
    except Exception:
        pass


class StudentViewSet(viewsets.ModelViewSet):
    """
    1-Qism 1. O'quvchilar:
    - Yangi o'quvchi qo'shish: POST /api/students/
    - O'quvchilar ro'yxatini olish: GET /api/students/
    - O'quvchi ma'lumotlarini o'zgartirish: PUT/PATCH /api/students/<id>/
    - O'quvchini o'chirish: DELETE /api/students/<id>/
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        group = self.request.query_params.get('group')

        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(phone__icontains=search) | qs.filter(group__icontains=search)
        if group:
            qs = qs.filter(group=group)
        return qs

    def perform_create(self, serializer):
        student = serializer.save()
        broadcast_ws('STUDENT_CREATED', StudentSerializer(student).data)

    def perform_update(self, serializer):
        student = serializer.save()
        broadcast_ws('STUDENT_UPDATED', StudentSerializer(student).data)

    def perform_destroy(self, instance):
        student_id = instance.id
        student_name = instance.name
        instance.delete()
        broadcast_ws('STUDENT_DELETED', {'id': student_id, 'name': student_name})

    @action(detail=True, methods=['get'], url_path='payments')
    def student_payments(self, request, pk=None):
        student = self.get_object()
        payments = student.payments.all()
        total_paid = payments.aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'student': StudentSerializer(student).data,
            'total_paid': total_paid,
            'payments': PaymentSerializer(payments, many=True).data
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    1-Qism 2. To'lovlar:
    - To'lov qo'shish: POST /api/payments/
    - To'lovlar ro'yxatini olish: GET /api/payments/?student_id=<id>&month=YYYY-MM
    """
    queryset = Payment.objects.all().select_related('student')
    serializer_class = PaymentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student_id')
        month = self.request.query_params.get('month')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if month:
            # month in YYYY-MM format
            try:
                year, month_num = map(int, month.split('-'))
                qs = qs.filter(date__year=year, date__month=month_num)
            except ValueError:
                pass
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        # Compute updated month balance
        payment_month = payment.date.strftime('%Y-%m')
        student = payment.student
        month_payments = Payment.objects.filter(
            student=student,
            date__year=payment.date.year,
            date__month=payment.date.month
        )
        total_paid_in_month = month_payments.aggregate(total=Sum('amount'))['total'] or 0
        remaining_debt = max(0, student.monthly_fee - total_paid_in_month)

        event_payload = {
            'payment': PaymentSerializer(payment).data,
            'student': {
                'id': student.id,
                'name': student.name,
                'group': student.group
            },
            'month': payment_month,
            'total_paid': total_paid_in_month,
            'remaining_debt': remaining_debt
        }
        broadcast_ws('PAYMENT_ADDED', event_payload)

        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['remaining_debt'] = remaining_debt
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class DebtorsAPIView(APIView):
    """
    1-Qism 3. Bir oy uchun qarzdorlar so'rovi:
    GET /debtors?month=YYYY-MM
    Oylik to'lov summasidan kam to'lagan o'quvchilarni va ularning qancha qarzi borligini qaytaradi.
    """
    def get(self, request):
        month = request.query_params.get('month')

        if not month:
            return Response(
                {"error": "month parametri majburiy (format: YYYY-MM, masalan: /debtors?month=2026-10)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        match = re.match(r'^(\d{4})-(0[1-9]|1[0-2])$', month)
        if not match:
            return Response(
                {"error": "Noto'g'ri oy formati. YYYY-MM formatida bo'lishi lozim (masalan: 2026-10)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        year, month_num = int(match.group(1)), int(match.group(2))

        students = Student.objects.all()
        debtors_list = []
        total_debt_sum = 0

        for student in students:
            # Get all payments by this student in the given month
            student_month_payments = Payment.objects.filter(
                student=student,
                date__year=year,
                date__month=month_num
            )
            paid_amount = student_month_payments.aggregate(total=Sum('amount'))['total'] or 0

            if paid_amount < student.monthly_fee:
                debt_amount = student.monthly_fee - paid_amount
                total_debt_sum += debt_amount

                debtors_list.append({
                    'id': student.id,
                    'name': student.name,
                    'phone': student.phone,
                    'group': student.group,
                    'monthly_fee': student.monthly_fee,
                    'paid_amount': paid_amount,
                    'debt_amount': debt_amount,
                    'payment_count': student_month_payments.count()
                })

        # Sort by highest debt first
        debtors_list.sort(key=lambda d: d['debt_amount'], reverse=True)

        return Response({
            'month': month,
            'total_students': students.count(),
            'debtor_count': len(debtors_list),
            'total_debt': total_debt_sum,
            'debtors': debtors_list
        })



class StatsAPIView(APIView):
    """Boshqaruv paneli umumiy statistikasi"""
    def get(self, request):
        now = timezone.now()
        current_month_str = now.strftime('%Y-%m')
        students = Student.objects.all()

        month_payments = Payment.objects.filter(date__year=now.year, date__month=now.month)
        total_collected = month_payments.aggregate(total=Sum('amount'))['total'] or 0

        total_debt = 0
        debtor_count = 0

        for s in students:
            paid = Payment.objects.filter(student=s, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
            if paid < s.monthly_fee:
                debtor_count += 1
                total_debt += (s.monthly_fee - paid)

        return Response({
            'current_month': current_month_str,
            'total_students': students.count(),
            'debtor_count': debtor_count,
            'total_debt': total_debt,
            'total_collected': total_collected,
            'total_payments_count': Payment.objects.count()
        })


class AnalyticsAPIView(APIView):
    """
    Oyma-oy va yillik tahlil hamda guruhlar ko'rsatkichlari:
    GET /api/analytics/?year=YYYY
    """
    def get(self, request):
        now = timezone.now()
        target_year = int(request.query_params.get('year', now.year))
        month_names = [
            "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
            "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"
        ]

        students = Student.objects.all()
        monthly_reports = []
        year_total_revenue = 0
        year_total_debt = 0

        for m in range(1, 13):
            month_str = f"{target_year}-{m:02d}"
            month_payments = Payment.objects.filter(date__year=target_year, date__month=m)
            collected = month_payments.aggregate(total=Sum('amount'))['total'] or 0

            month_debt = 0
            debtor_count = 0
            expected = 0

            for s in students:
                expected += s.monthly_fee
                s_paid = Payment.objects.filter(student=s, date__year=target_year, date__month=m).aggregate(total=Sum('amount'))['total'] or 0
                if s_paid < s.monthly_fee:
                    debtor_count += 1
                    month_debt += (s.monthly_fee - s_paid)

            year_total_revenue += collected
            if target_year < now.year or (target_year == now.year and m <= now.month):
                year_total_debt += month_debt

            target_total = collected + month_debt
            rate = round((collected / target_total) * 100) if target_total > 0 else 0

            is_future = (target_year > now.year) or (target_year == now.year and m > now.month)

            monthly_reports.append({
                'month': month_str,
                'month_name': month_names[m - 1],
                'month_index': m,
                'collected': collected,
                'payments_count': month_payments.count(),
                'debt': month_debt,
                'debtor_count': debtor_count,
                'expected': expected,
                'collection_rate': rate,
                'is_future': is_future
            })

        # Group analytics
        groups = Student.objects.values_list('group', flat=True).distinct()
        group_analytics = []
        for grp in groups:
            grp_students = Student.objects.filter(group=grp)
            grp_payments = Payment.objects.filter(student__group=grp, date__year=target_year)
            grp_collected = grp_payments.aggregate(total=Sum('amount'))['total'] or 0
            monthly_exp = grp_students.aggregate(total=Sum('monthly_fee'))['total'] or 0

            current_debt = 0
            for st in grp_students:
                st_paid = Payment.objects.filter(student=st, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
                if st_paid < st.monthly_fee:
                    current_debt += (st.monthly_fee - st_paid)

            discipline = round(((monthly_exp - current_debt) / monthly_exp) * 100) if monthly_exp > 0 else 100

            group_analytics.append({
                'group': grp,
                'students_count': grp_students.count(),
                'total_collected': grp_collected,
                'monthly_expected': monthly_exp,
                'current_debt': current_debt,
                'discipline_rate': max(0, discipline)
            })

        # Payment methods
        methods = Payment.objects.filter(date__year=target_year).values('payment_method').annotate(
            amount=Sum('amount')
        ).order_by('-amount')

        total_methods = sum(item['amount'] for item in methods) or 1
        payment_methods = [
            {
                'method': item['payment_method'],
                'amount': item['amount'],
                'count': Payment.objects.filter(date__year=target_year, payment_method=item['payment_method']).count(),
                'percentage': round((item['amount'] / total_methods) * 100)
            }
            for item in methods
        ]

        active_count = len([m for m in monthly_reports if not m['is_future']])
        avg_monthly = round(year_total_revenue / active_count) if active_count > 0 else 0
        best_month = max(monthly_reports, key=lambda x: x['collected'], default=monthly_reports[0])

        return Response({
            'year': str(target_year),
            'monthly_reports': monthly_reports,
            'group_analytics': group_analytics,
            'payment_methods': payment_methods,
            'summary': {
                'total_year_revenue': year_total_revenue,
                'total_year_debt': year_total_debt,
                'average_monthly_revenue': avg_monthly,
                'highest_month_name': best_month['month_name'],
                'highest_month_amount': best_month['collected'],
                'total_payments_count': Payment.objects.filter(date__year=target_year).count(),
                'overall_collection_rate': round((year_total_revenue / (year_total_revenue + year_total_debt)) * 100) if (year_total_revenue + year_total_debt) > 0 else 0,
                'total_students': students.count()
            }
        })

