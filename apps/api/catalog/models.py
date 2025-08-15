from django.db import models
from django.conf import settings

# Import appropriate storage service based on configuration
if getattr(settings, 'USE_LOCAL_STORAGE', False):
    from core.local_storage import storage_service
else:
    from core.storage import storage_service

class Author(models.Model):
    name = models.CharField(max_length=150)
    
    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=80, unique=True)
    
    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    author = models.ForeignKey(Author, on_delete=models.PROTECT)
    genres = models.ManyToManyField(Genre, blank=True)
    
    # Asset flags - track which assets are uploaded
    has_cover = models.BooleanField(default=False)
    has_model = models.BooleanField(default=False)
    has_pages = models.BooleanField(default=False)
    
    # Legacy URL fields (deprecated - use S3 storage)
    cover_image = models.URLField(blank=True, help_text="Deprecated: Use S3 storage")
    gltf_url = models.URLField(blank=True, help_text="Deprecated: Use S3 storage")
    sample_pdf_url = models.URLField(blank=True, help_text="Deprecated: Use S3 storage")
    
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    # S3 Asset Management Methods
    def get_cover_key(self):
        """Get S3 key for book cover image."""
        return storage_service.get_asset_key('covers', self.id)
    
    def get_model_key(self):
        """Get S3 key for 3D model file."""
        return storage_service.get_asset_key('models', self.id, 'model.glb')
    
    def get_pages_key(self, page_number=1):
        """Get S3 key for page texture."""
        return storage_service.get_asset_key('pages', self.id, str(page_number))
    
    def get_cover_url(self, signed=True):
        """Get URL for book cover (signed or public)."""
        if not self.has_cover:
            return None
        
        key = self.get_cover_key()
        if signed:
            return storage_service.generate_signed_url(key)
        return storage_service.get_public_url(key)
    
    def get_model_url(self, signed=True):
        """Get URL for 3D model (signed or public)."""
        if not self.has_model:
            return None
            
        key = self.get_model_key()
        if signed:
            return storage_service.generate_signed_url(key)
        return storage_service.get_public_url(key)
    
    def get_page_url(self, page_number=1, signed=True):
        """Get URL for page texture (signed or public)."""
        if not self.has_pages:
            return None
            
        key = self.get_pages_key(page_number)
        if signed:
            return storage_service.generate_signed_url(key)
        return storage_service.get_public_url(key)
    
    def delete_assets(self):
        """Delete all S3 assets for this book."""
        deleted = []
        
        if self.has_cover:
            if storage_service.delete_file(self.get_cover_key()):
                self.has_cover = False
                deleted.append('cover')
        
        if self.has_model:
            if storage_service.delete_file(self.get_model_key()):
                self.has_model = False
                deleted.append('model')
        
        if self.has_pages:
            # Delete all page textures (assuming max 100 pages)
            for i in range(1, 101):
                key = self.get_pages_key(i)
                storage_service.delete_file(key)
            self.has_pages = False
            deleted.append('pages')
        
        if deleted:
            self.save(update_fields=['has_cover', 'has_model', 'has_pages'])
        
        return deleted
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['available_copies']),
        ]