from django.core.management.base import BaseCommand
from academy.models import Student, Payment
from datetime import date

class Command(BaseCommand):
    help = "Seed initial students and payments test data for Ecomdev task"

    def handle(self, *args, **options):
        self.stdout.write("Ma'lumotlar tozalanmoqda va boshlang'ich data yuklanmoqda...")
        Payment.objects.all().delete()
        Student.objects.all().delete()

        students_data = [
            {"id": 1, "name": "Alisher Navoiy", "phone": "+998 90 123 45 67", "group": "Frontend React (FN-101)", "monthly_fee": 1200000},
            {"id": 2, "name": "Zulayho Karimova", "phone": "+998 93 987 65 43", "group": "Python Django (PY-202)", "monthly_fee": 1500000},
            {"id": 3, "name": "Javohir Toshmatov", "phone": "+998 97 555 44 33", "group": "Frontend React (FN-101)", "monthly_fee": 1200000},
            {"id": 4, "name": "Madina Rahimova", "phone": "+998 91 333 22 11", "group": "Fullstack Ecomdev (EC-303)", "monthly_fee": 1800000},
            {"id": 5, "name": "Sardorbek Olimov", "phone": "+998 94 777 88 99", "group": "Python Django (PY-202)", "monthly_fee": 1500000},
            {"id": 6, "name": "Nigora Usmonova", "phone": "+998 99 444 33 22", "group": "Fullstack Ecomdev (EC-303)", "monthly_fee": 1800000},
        ]

        created_students = {}
        for s in students_data:
            obj = Student.objects.create(
                id=s["id"],
                name=s["name"],
                phone=s["phone"],
                group=s["group"],
                monthly_fee=s["monthly_fee"]
            )
            created_students[s["id"]] = obj

        payments_data = [
            {"student_id": 1, "amount": 1200000, "date": date(2026, 10, 5), "payment_method": "Payme", "note": "To'liq to'lov"},
            {"student_id": 2, "amount": 1000000, "date": date(2026, 10, 8), "payment_method": "Click", "note": "1-qism to'lov"},
            {"student_id": 4, "amount": 800000, "date": date(2026, 10, 12), "payment_method": "Bank o'tkazmasi", "note": "Avans"},
            {"student_id": 6, "amount": 1800000, "date": date(2026, 10, 15), "payment_method": "Naqd", "note": "Kassaga to'landi"},
            {"student_id": 1, "amount": 1200000, "date": date(2026, 9, 5), "payment_method": "Payme", "note": "Sentabr to'lovi"},
            {"student_id": 2, "amount": 1500000, "date": date(2026, 9, 7), "payment_method": "Click", "note": "Sentabr to'liq"},
            {"student_id": 3, "amount": 1200000, "date": date(2026, 9, 10), "payment_method": "Naqd", "note": "Sentabr to'liq"},
            {"student_id": 5, "amount": 750000, "date": date(2026, 9, 12), "payment_method": "Click", "note": "Sentabr qisman"},
        ]

        for p in payments_data:
            Payment.objects.create(
                student=created_students[p["student_id"]],
                amount=p["amount"],
                date=p["date"],
                payment_method=p["payment_method"],
                note=p["note"]
            )

        self.stdout.write(self.style.SUCCESS(f"Tayyor! {len(created_students)} ta o'quvchi va {len(payments_data)} ta to'lov yuklandi."))
