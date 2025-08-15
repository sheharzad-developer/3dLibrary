import boto3
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from django.conf import settings
from typing import Optional, Dict, Any
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class S3StorageService:
    """Service for handling S3 storage operations for 3D Library assets."""
    
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
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self.region = settings.AWS_S3_REGION_NAME
        self.folders = settings.ASSET_FOLDERS
        
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=self.region
            )
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            self.s3_client = None
    
    def create_bucket_if_not_exists(self) -> bool:
        """Create S3 bucket with required folder structure if it doesn't exist."""
        if not self.s3_client:
            return False
            
        try:
            # Check if bucket exists
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} already exists")
        except ClientError as e:
            error_code = int(e.response['Error']['Code'])
            if error_code == 404:
                # Bucket doesn't exist, create it
                try:
                    if self.region == 'us-east-1':
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={'LocationConstraint': self.region}
                        )
                    logger.info(f"Created bucket {self.bucket_name}")
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket: {create_error}")
                    return False
            else:
                logger.error(f"Error checking bucket: {e}")
                return False
        
        # Create folder structure by uploading placeholder objects
        for folder_name, folder_path in self.folders.items():
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=f"{folder_path}.gitkeep",
                    Body=b''
                )
            except ClientError as e:
                logger.warning(f"Failed to create folder {folder_path}: {e}")
        
        return True
    
    def generate_signed_url(self, object_key: str, expiration: int = None) -> Optional[str]:
        """Generate a signed URL for accessing an S3 object."""
        if not self.s3_client:
            return None
            
        expiration = expiration or settings.SIGNED_URL_EXPIRATION
        
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logger.error(f"Failed to generate signed URL for {object_key}: {e}")
            return None
    
    def validate_content_type(self, asset_type: str, content_type: str) -> bool:
        """
        Validate content type against allowed types for asset type
        
        Args:
            asset_type: Type of asset (cover, model, page)
            content_type: MIME type to validate
            
        Returns:
            True if content type is allowed, False otherwise
        """
        config = self.CONTENT_TYPE_CONFIG.get(asset_type)
        if not config:
            return False
        
        return content_type in config['allowed_types']
    
    def get_max_size_for_asset_type(self, asset_type: str) -> int:
        """
        Get maximum file size in MB for asset type
        
        Args:
            asset_type: Type of asset (cover, model, page)
            
        Returns:
            Maximum size in MB
        """
        config = self.CONTENT_TYPE_CONFIG.get(asset_type, {})
        return config.get('max_size_mb', 50)
    
    def generate_presigned_post(self, object_key: str, file_type: str = None, 
                               asset_type: str = None, max_file_size: int = 100 * 1024 * 1024) -> Optional[Dict[str, Any]]:
        """Generate a presigned POST URL for direct uploads."""
        if not self.s3_client:
            return None
            
        conditions = [
            ['content-length-range', 0, max_file_size]
        ]
        
        if file_type:
            conditions.append(['starts-with', '$Content-Type', file_type])
        
        try:
            response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=object_key,
                Conditions=conditions,
                ExpiresIn=3600  # 1 hour
            )
            return response
        except ClientError as e:
            logger.error(f"Failed to generate presigned POST for {object_key}: {e}")
            return None
    
    def validate_object_exists(self, key: str) -> bool:
        """Validate that an object exists in S3 using HEAD request."""
        if not self.s3_client:
            return False
            
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"Object validation successful for key: {key}")
            return True
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                logger.warning(f"Object not found for key: {key}")
                return False
            else:
                logger.error(f"Error validating object {key}: {e}")
                return False
        except Exception as e:
            logger.error(f"Unexpected error validating object {key}: {e}")
            return False
    
    def get_object_metadata(self, key: str) -> Optional[Dict[str, Any]]:
        """Get object metadata including size, content-type, and last modified."""
        if not self.s3_client:
            return None
            
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return {
                'size': response.get('ContentLength', 0),
                'content_type': response.get('ContentType', ''),
                'last_modified': response.get('LastModified'),
                'etag': response.get('ETag', '').strip('"'),
            }
        except ClientError as e:
            logger.error(f"Error getting metadata for {key}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting metadata for {key}: {e}")
            return None
    
    def upload_file(self, file_obj, object_key: str, content_type: str = None) -> bool:
        """Upload a file to S3."""
        if not self.s3_client:
            return False
            
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type
            
        try:
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_key,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded {object_key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to upload {object_key}: {e}")
            return False
    
    def delete_file(self, object_key: str) -> bool:
        """Delete a file from S3."""
        if not self.s3_client:
            return False
            
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            logger.info(f"Successfully deleted {object_key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete {object_key}: {e}")
            return False
    
    def get_asset_key(self, asset_type: str, book_id: int, filename: str = None) -> str:
        """Generate S3 object key for book assets."""
        folder = self.folders.get(asset_type, '')
        
        if asset_type == 'models':
            return f"{folder}{book_id}.glb"
        elif asset_type == 'covers':
            extension = filename.split('.')[-1] if filename else 'jpg'
            return f"{folder}{book_id}.{extension}"
        elif asset_type == 'pages':
            page_num = filename or '1'
            return f"{folder}{book_id}/{page_num}.jpg"
        else:
            return f"{folder}{book_id}/{filename or 'asset'}"
    
    def get_public_url(self, object_key: str) -> str:
        """Get public URL for an object (if bucket is public)."""
        return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{object_key}"

# Global instance
storage_service = S3StorageService()