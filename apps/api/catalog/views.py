from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Book, Author, Genre
from .serializers import BookSerializer, AuthorSerializer, GenreSerializer
import logging

# Import appropriate storage service based on configuration
if getattr(settings, 'USE_LOCAL_STORAGE', False):
    from core.local_storage import storage_service
else:
    from core.storage import storage_service

logger = logging.getLogger(__name__)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().select_related('author').prefetch_related('genres').order_by('-created_at')
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['author', 'genres__id']
    search_fields = ['title', 'author__name', 'genres__name']
    
    @action(detail=True, methods=['get'], url_path='assets/cover')
    def get_cover_url(self, request, pk=None):
        """Get signed URL for book cover."""
        book = get_object_or_404(Book, pk=pk)
        
        if not book.has_cover:
            return Response(
                {'error': 'No cover image available for this book'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            signed_url = book.get_cover_url(signed=True)
            return Response({
                'url': signed_url,
                'expires_in': 3600,  # 1 hour
                'asset_type': 'cover'
            })
        except Exception as e:
            logger.error(f"Error generating cover URL for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to generate asset URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='assets/model')
    def get_model_url(self, request, pk=None):
        """Get signed URL for 3D model."""
        book = get_object_or_404(Book, pk=pk)
        
        if not book.has_model:
            return Response(
                {'error': 'No 3D model available for this book'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            signed_url = book.get_model_url(signed=True)
            return Response({
                'url': signed_url,
                'expires_in': 3600,  # 1 hour
                'asset_type': 'model'
            })
        except Exception as e:
            logger.error(f"Error generating model URL for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to generate asset URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='assets/pages/(?P<page_number>[0-9]+)')
    def get_page_url(self, request, pk=None, page_number=1):
        """Get signed URL for page texture."""
        book = get_object_or_404(Book, pk=pk)
        
        if not book.has_pages:
            return Response(
                {'error': 'No page textures available for this book'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            page_num = int(page_number)
            if page_num < 1 or page_num > 100:  # Reasonable limit
                return Response(
                    {'error': 'Page number must be between 1 and 100'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            signed_url = book.get_page_url(page_number=page_num, signed=True)
            return Response({
                'url': signed_url,
                'expires_in': 3600,  # 1 hour
                'asset_type': 'page',
                'page_number': page_num
            })
        except ValueError:
            return Response(
                {'error': 'Invalid page number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error generating page URL for book {pk}, page {page_number}: {str(e)}")
            return Response(
                {'error': 'Failed to generate asset URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='assets/upload/cover', permission_classes=[IsAdminUser])
    def upload_cover(self, request, pk=None):
        """Generate pre-signed POST URL for cover upload with enhanced validation."""
        book = get_object_or_404(Book, pk=pk)
        content_type = request.data.get('content_type', 'image/webp')
        
        # Validate content type
        if not storage_service.validate_content_type('cover', content_type):
            return Response(
                {
                    'error': 'Invalid content type for cover',
                    'allowed_types': storage_service.CONTENT_TYPE_CONFIG['cover']['allowed_types']
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            key = book.get_cover_key()
            max_size_mb = storage_service.get_max_size_for_asset_type('cover')
            
            presigned_post = storage_service.generate_presigned_post(
                key=key,
                content_type=content_type,
                asset_type='cover',
                max_size_mb=max_size_mb
            )
            
            return Response({
                'upload_url': presigned_post['url'],
                'fields': presigned_post['fields'],
                'key': key,
                'asset_type': 'cover',
                'content_type': content_type,
                'max_size_mb': max_size_mb,
                'compression_recommended': storage_service.CONTENT_TYPE_CONFIG['cover']['compression_recommended'],
                'expires_in': 3600
            })
        except Exception as e:
            logger.error(f"Error generating cover upload URL for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to generate upload URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='assets/upload/model', permission_classes=[IsAdminUser])
    def upload_model(self, request, pk=None):
        """Generate pre-signed POST URL for 3D model upload with enhanced validation."""
        book = get_object_or_404(Book, pk=pk)
        content_type = request.data.get('content_type', 'model/gltf-binary')
        
        # Validate content type
        if not storage_service.validate_content_type('model', content_type):
            return Response(
                {
                    'error': 'Invalid content type for 3D model',
                    'allowed_types': storage_service.CONTENT_TYPE_CONFIG['model']['allowed_types']
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            key = book.get_model_key()
            max_size_mb = storage_service.get_max_size_for_asset_type('model')
            
            presigned_post = storage_service.generate_presigned_post(
                key=key,
                content_type=content_type,
                asset_type='model',
                max_size_mb=max_size_mb
            )
            
            return Response({
                'upload_data': presigned_post,
                'key': key,
                'asset_type': 'model',
                'content_type': content_type,
                'max_size_mb': max_size_mb,
                'compression_recommended': storage_service.CONTENT_TYPE_CONFIG['model']['compression_recommended'],
                'preferred_format': storage_service.CONTENT_TYPE_CONFIG['model']['preferred_format'],
                'expires_in': 3600
            })
        except Exception as e:
            logger.error(f"Error generating model upload URL for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to generate upload URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='assets/upload/pages', permission_classes=[IsAdminUser])
    def upload_pages(self, request, pk=None):
        """Generate pre-signed POST URL for page texture upload with enhanced validation."""
        book = get_object_or_404(Book, pk=pk)
        page_number = request.data.get('page_number', 1)
        content_type = request.data.get('content_type', 'image/jpeg')
        
        # Validate content type
        if not storage_service.validate_content_type('page', content_type):
            return Response(
                {
                    'error': 'Invalid content type for page texture',
                    'allowed_types': storage_service.CONTENT_TYPE_CONFIG['page']['allowed_types']
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            page_num = int(page_number)
            if page_num < 1 or page_num > 100:
                return Response(
                    {'error': 'Page number must be between 1 and 100'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            key = book.get_pages_key(page_number=page_num)
            max_size_mb = storage_service.get_max_size_for_asset_type('page')
            
            presigned_post = storage_service.generate_presigned_post(
                key=key,
                content_type=content_type,
                asset_type='page',
                max_size_mb=max_size_mb
            )
            
            return Response({
                'upload_url': presigned_post['url'],
                'fields': presigned_post['fields'],
                'key': key,
                'asset_type': 'page',
                'page_number': page_num,
                'content_type': content_type,
                'max_size_mb': max_size_mb,
                'compression_recommended': storage_service.CONTENT_TYPE_CONFIG['page']['compression_recommended'],
                'expires_in': 3600
            })
        except ValueError:
            return Response(
                {'error': 'Invalid page number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error generating page upload URL for book {pk}, page {page_number}: {str(e)}")
            return Response(
                {'error': 'Failed to generate upload URL'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='assets/confirm-upload', permission_classes=[IsAdminUser])
    def confirm_upload(self, request, pk=None):
        """Confirm successful asset upload and update book flags."""
        book = get_object_or_404(Book, pk=pk)
        asset_type = request.data.get('asset_type')
        object_key = request.data.get('object_key')
        
        if asset_type not in ['cover', 'model', 'pages']:
            return Response(
                {'error': 'Invalid asset type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not object_key:
            return Response(
                {'error': 'object_key is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Validate object exists in S3 before updating database
            if not storage_service.validate_object_exists(object_key):
                return Response(
                    {'error': 'Object not found in storage. Upload may have failed.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get object metadata for additional validation
            metadata = storage_service.get_object_metadata(object_key)
            if not metadata:
                return Response(
                    {'error': 'Unable to retrieve object metadata'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Validate content type based on asset type
            content_type = metadata.get('content_type', '')
            updated_fields = []
            
            if asset_type == 'cover':
                if not content_type.startswith('image/'):
                    return Response(
                        {'error': 'Invalid content type for cover image'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                book.has_cover = True
                updated_fields.append('has_cover')
            elif asset_type == 'model':
                if content_type not in ['model/gltf-binary', 'application/octet-stream']:
                    return Response(
                        {'error': 'Invalid content type for 3D model'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                book.has_model = True
                updated_fields.append('has_model')
            elif asset_type == 'pages':
                if not content_type.startswith('image/'):
                    return Response(
                        {'error': 'Invalid content type for page image'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                book.has_pages = True
                updated_fields.append('has_pages')
            
            book.save(update_fields=updated_fields)
            
            return Response({
                'message': f'{asset_type.title()} upload confirmed successfully',
                'asset_type': asset_type,
                'book_id': book.id,
                'metadata': {
                    'size': metadata.get('size'),
                    'content_type': metadata.get('content_type'),
                    'last_modified': metadata.get('last_modified')
                }
            })
        except Exception as e:
            logger.error(f"Error confirming upload for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to confirm upload'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'], url_path='assets', permission_classes=[IsAdminUser])
    def delete_assets(self, request, pk=None):
        """Delete all assets for a book."""
        book = get_object_or_404(Book, pk=pk)
        deleted_assets = []
        errors = []
        
        try:
            # Delete assets from S3
            if book.has_cover:
                cover_key = book.get_cover_key()
                if storage_service.delete_file(cover_key):
                    deleted_assets.append(f'cover: {cover_key}')
                    book.has_cover = False
                else:
                    errors.append(f'Failed to delete cover: {cover_key}')
            
            if book.has_model:
                model_key = book.get_model_key()
                if storage_service.delete_file(model_key):
                    deleted_assets.append(f'model: {model_key}')
                    book.has_model = False
                else:
                    errors.append(f'Failed to delete model: {model_key}')
            
            if book.has_pages:
                # Delete all page assets (this is a simplified approach)
                # In practice, you might want to track individual page numbers
                pages_deleted = 0
                for i in range(1, 101):  # Assuming max 100 pages
                    page_key = book.get_pages_key(page_number=i)
                    if storage_service.validate_object_exists(page_key):
                        if storage_service.delete_file(page_key):
                            pages_deleted += 1
                        else:
                            errors.append(f'Failed to delete page: {page_key}')
                
                if pages_deleted > 0:
                    deleted_assets.append(f'pages: {pages_deleted} files')
                    book.has_pages = False
            
            book.save()
            
            response_data = {
                'message': 'Asset deletion completed',
                'deleted_assets': deleted_assets,
                'book_id': book.id
            }
            
            if errors:
                response_data['errors'] = errors
                return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error deleting assets for book {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to delete assets'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]