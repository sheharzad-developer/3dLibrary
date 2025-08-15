from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Borrow
from catalog.models import Book
from rest_framework.serializers import ModelSerializer

class BorrowSerializer(ModelSerializer):
    class Meta:
        model = Borrow
        fields = '__all__'

class BorrowViewSet(viewsets.ModelViewSet):
    queryset = Borrow.objects.select_related('book', 'user').all()
    serializer_class = BorrowSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def borrow(self, request):
        book_id = request.data.get('book_id')
        days = int(request.data.get('days', 14))
        b = Book.objects.get(pk=book_id)
        due = timezone.now() + timedelta(days=days)
        rec = Borrow.borrow_book(request.user, b, due)
        return Response(self.get_serializer(rec).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        rec = self.get_object()
        rec.return_book()
        return Response(self.get_serializer(rec).data)