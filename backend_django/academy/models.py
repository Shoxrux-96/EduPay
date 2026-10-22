from django.db import models

class Student(models.Model):
    """
    1-Qism: O'quvchilar modeli
    Ism, telefon raqami, guruh, oylik to'lov summasi
    """
    name = models.CharField(max_length=255, verbose_name="Ism va familiya")
    phone = models.CharField(max_length=50, verbose_name="Telefon raqami")
    group = models.CharField(max_length=100, verbose_name="Guruh")
    monthly_fee = models.PositiveIntegerField(verbose_name="Oylik to'lov summasi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Qo'shilgan sana")

    class Meta:
        ordering = ['-id']
        verbose_name = "O'quvchi"
        verbose_name_plural = "O'quvchilar"

    def __str__(self):
        return f"{self.name} ({self.group}) - {self.monthly_fee:,} so'm"


class Payment(models.Model):
    """
    2-Qism: To'lovlar modeli
    O'quvchi, summa, sana
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="O'quvchi"
    )
    amount = models.PositiveIntegerField(verbose_name="To'lov summasi")
    date = models.DateField(verbose_name="To'lov sanasi")
    payment_method = models.CharField(
        max_length=50,
        default="Payme",
        verbose_name="To'lov usuli"
    )
    note = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Izoh"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Kiritilgan vaqt")

    class Meta:
        ordering = ['-date', '-id']
        verbose_name = "To'lov"
        verbose_name_plural = "To'lovlar"

    def __str__(self):
        return f"{self.student.name}: {self.amount:,} so'm ({self.date})"
