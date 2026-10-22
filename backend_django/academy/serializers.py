from rest_framework import serializers
from .models import Student, Payment

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'phone', 'group', 'monthly_fee', 'created_at']

    def validate_monthly_fee(self, value):
        if value <= 0:
            raise serializers.ValidationError("Oylik to'lov summasi 0 dan katta bo'lishi kerak.")
        return value


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')
    student_group = serializers.ReadOnlyField(source='student.group')
    student_phone = serializers.ReadOnlyField(source='student.phone')

    class Meta:
        model = Payment
        fields = [
            'id',
            'student',
            'student_name',
            'student_group',
            'student_phone',
            'amount',
            'date',
            'payment_method',
            'note',
            'created_at'
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("To'lov summasi 0 dan katta bo'lishi kerak.")
        return value


class DebtorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField()
    group = serializers.CharField()
    monthly_fee = serializers.IntegerField()
    paid_amount = serializers.IntegerField()
    debt_amount = serializers.IntegerField()
    payment_count = serializers.IntegerField()
