import os
import logging
import shutil
from django.conf import settings
from django.core.files.storage import default_storage
from django.urls import reverse
from typing import Optional, Dict, Any
from urllib.parse import urljoin
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

class LocalStorageService:
    """Service for handling local file storage operations for 3D Library assets."""
    
    # Supported content types and their configurations
    CONTENT_TYPE_CONFIG = {
        'cover': {
            'allowed_types': ['image/jpeg', 'image/png', 'image/webp'],
            'max_size_mb': 10,
            'compression_recommended': True
        },
        'model': {
            'allowed_types': ['model/gltf-binary', 'application/octet-stream'],
            'max_size_mb': 100,
            'compression_recommended': True,  # Draco compression
            'preferred_format': 'glb'
        },
        'page': {
            'allowed_types': ['image/jpeg', 'image/png', 'image/webp'],
            'max_size_mb': 5,
            'compression_recommended': True  # KTX2 for textures
        }
    }
    
    def __init__(self):
        self.media_root = settings.MEDIA_ROOT
        self.media_url = settings.MEDIA_URL
        self.folders = getattr(settings, 'ASSET_FOLDERS', {
            'covers': 'assets/covers/',
            'models': 'assets/models/',
            'pages': 'assets/pages/'
        })
        
        # Ensure media directories exist
        self.create_directories()
    
    def create_directories(self) -> bool:
        """Create local asset directories if they don't exist."""
        try:
            for folder_name, folder_path in self.folders.items():
                full_path = os.path.join(self.media_root, folder_path)
                os.makedirs(full_path, exist_ok=True)
                logger.info(f"Created/verified directory: {full_path}")
            return True
        except Exception as e:
            logger.error(f"Error creating directories: {str(e)}")
            return False
    
    def generate_signed_url(self, object_key: str, expiration: int = None) -> Optional[str]:
        """Generate a public URL for the asset (no signing needed for local files)."""
        try:
            return self.get_public_url(object_key)
        except Exception as e:
            logger.error(f"Error generating URL for {object_key}: {str(e)}")
            return None
    
    def validate_content_type(self, asset_type: str, content_type: str) -> bool:
        """Validate if the content type is allowed for the given asset type."""
        if asset_type not in self.CONTENT_TYPE_CONFIG:
            logger.warning(f"Unknown asset type: {asset_type}")
            return False
        
        allowed_types = self.CONTENT_TYPE_CONFIG[asset_type]['allowed_types']
        is_valid = content_type in allowed_types
        
        if not is_valid:
            logger.warning(f"Invalid content type {content_type} for asset type {asset_type}")
        
        return is_valid
    
    def get_max_size_for_asset_type(self, asset_type: str) -> int:
        """Get the maximum file size in bytes for the given asset type."""
        if asset_type not in self.CONTENT_TYPE_CONFIG:
            logger.warning(f"Unknown asset type: {asset_type}, using default 10MB")
            return 10 * 1024 * 1024  # 10MB default
        
        max_size_mb = self.CONTENT_TYPE_CONFIG[asset_type]['max_size_mb']
        return max_size_mb * 1024 * 1024  # Convert to bytes
    
    def generate_presigned_post(self, object_key: str, file_type: str = None, 
                               asset_type: str = None, max_file_size: int = 100 * 1024 * 1024) -> Optional[Dict[str, Any]]:
        """Generate presigned POST data for direct upload (simplified for local storage)."""
        try:
            # For local storage, we return a simple upload endpoint
            upload_url = reverse('upload_asset')  # You'll need to create this endpoint
            
            return {
                'url': upload_url,
                'fields': {
                    'key': object_key,
                    'Content-Type': file_type or 'application/octet-stream',
                    'asset_type': asset_type or 'unknown'
                }
            }
        except Exception as e:
            logger.error(f"Error generating presigned post for {object_key}: {str(e)}")
            return None
    
    def validate_object_exists(self, key: str) -> bool:
        """Check if an object exists in local storage."""
        try:
            file_path = os.path.join(self.media_root, key)
            exists = os.path.exists(file_path) and os.path.isfile(file_path)
            
            if not exists:
                logger.info(f"Object {key} does not exist")
            
            return exists
        except Exception as e:
            logger.error(f"Error checking if object {key} exists: {str(e)}")
            return False
    
    def get_object_metadata(self, key: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a local file."""
        try:
            file_path = os.path.join(self.media_root, key)
            if not os.path.exists(file_path):
                return None
            
            stat = os.stat(file_path)
            return {
                'ContentLength': stat.st_size,
                'LastModified': stat.st_mtime,
                'ContentType': self._guess_content_type(file_path),
                'ETag': f'"{hash(key)}"'  # Simple hash-based ETag
            }
        except Exception as e:
            logger.error(f"Error getting metadata for {key}: {str(e)}")
            return None
    
    def _guess_content_type(self, file_path: str) -> str:
        """Guess content type based on file extension."""
        import mimetypes
        content_type, _ = mimetypes.guess_type(file_path)
        return content_type or 'application/octet-stream'
    
    def upload_file(self, file_obj, object_key: str, content_type: str = None) -> bool:
        """Upload a file to local storage."""
        try:
            file_path = os.path.join(self.media_root, object_key)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Write file
            with open(file_path, 'wb') as f:
                if hasattr(file_obj, 'read'):
                    # File-like object
                    shutil.copyfileobj(file_obj, f)
                else:
                    # Bytes
                    f.write(file_obj)
            
            logger.info(f"Successfully uploaded file to {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error uploading file {object_key}: {str(e)}")
            return False
    
    def delete_file(self, object_key: str) -> bool:
        """Delete a file from local storage."""
        try:
            file_path = os.path.join(self.media_root, object_key)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Successfully deleted file {file_path}")
                return True
            else:
                logger.warning(f"File {file_path} does not exist")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file {object_key}: {str(e)}")
            return False
    
    def get_asset_key(self, asset_type: str, book_id: int, filename: str = None) -> str:
        """Generate a standardized asset key for local storage."""
        folder_map = {
            'cover': 'covers',
            'model': 'models',
            'models': 'models', 
            'page': 'pages'
        }
        
        folder = folder_map.get(asset_type, 'misc')
        folder_path = self.folders.get(folder, f'assets/{folder}/')
        
        if filename:
            return f"{folder_path}book_{book_id}/{filename}"
        else:
            return f"{folder_path}book_{book_id}/"
    
    def get_public_url(self, object_key: str) -> str:
        """Get the public URL for accessing the asset."""
        # Remove leading slash if present
        clean_key = object_key.lstrip('/')
        return urljoin(self.media_url, clean_key)

# Create service instance
storage_service = LocalStorageService()