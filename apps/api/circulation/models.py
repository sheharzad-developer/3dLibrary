from django.db import models, transaction
from django.conf import settings
from catalog.models import Book

class Borrow(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    borrowed_at = models.DateTimeField(auto_now_add=True)
    due_at = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['user', 'book', 'returned_at'])]

    @classmethod
    def borrow_book(cls, user, book, due_at):
        with transaction.atomic():
            b = Book.objects.select_for_update().get(pk=book.pk)
            if b.available_copies < 1:
                raise ValueError('Not available')
            b.available_copies -= 1
            b.save()
            return cls.objects.create(user=user, book=b, due_at=due_at)

    def return_book(self):
        if self.returned_at:
            return self
        from django.utils import timezone
        self.returned_at = timezone.now()
        self.save(update_fields=['returned_at'])
        Book.objects.filter(pk=self.book_id).update(available_copies=models.F('available_copies') + 1)
        return self