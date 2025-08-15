from rest_framework import serializers
from .models import Book, Author, Genre

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    
    # Asset availability flags
    has_cover = serializers.BooleanField(read_only=True)
    has_model = serializers.BooleanField(read_only=True)
    has_pages = serializers.BooleanField(read_only=True)
    
    # Asset URLs (computed fields)
    cover_url = serializers.SerializerMethodField()
    model_url = serializers.SerializerMethodField()
    
    # Asset endpoints
    asset_endpoints = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'description', 'author', 'genres',
            'has_cover', 'has_model', 'has_pages',
            'cover_url', 'model_url', 'asset_endpoints',
            'total_copies', 'available_copies',
            'created_at', 'updated_at',
            # Legacy fields (deprecated)
            'cover_image', 'gltf_url', 'sample_pdf_url'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_cover_url(self, obj):
        """Get public cover URL if available."""
        if obj.has_cover:
            return obj.get_cover_url(signed=False)
        return None
    
    def get_model_url(self, obj):
        """Get public model URL if available."""
        if obj.has_model:
            return obj.get_model_url(signed=False)
        return None
    
    def get_asset_endpoints(self, obj):
        """Get asset-related API endpoints for this book."""
        base_url = f'/api/books/{obj.id}/assets'
        
        endpoints = {
            'cover': {
                'get': f'{base_url}/cover/' if obj.has_cover else None,
                'upload': f'{base_url}/upload/cover/',
            },
            'model': {
                'get': f'{base_url}/model/' if obj.has_model else None,
                'upload': f'{base_url}/upload/model/',
            },
            'pages': {
                'get': f'{base_url}/pages/{{page_number}}/' if obj.has_pages else None,
                'upload': f'{base_url}/upload/pages/',
            },
            'confirm_upload': f'{base_url}/confirm-upload/',
            'delete_all': f'{base_url}/'
        }
        
        return endpoints

class BookCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating books without nested objects."""
    
    class Meta:
        model = Book
        fields = [
            'title', 'description', 'author', 'genres',
            'total_copies', 'available_copies'
        ]
    
    def validate_available_copies(self, value):
        """Ensure available copies don't exceed total copies."""
        total_copies = self.initial_data.get('total_copies', 1)
        if value > total_copies:
            raise serializers.ValidationError(
                "Available copies cannot exceed total copies."
            )
        return value