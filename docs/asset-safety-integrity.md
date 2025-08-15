# Asset Safety & Integrity Implementation

This document outlines the safety and integrity measures implemented for the S3 asset storage system.

## Security Features Implemented ✅

### 1. Content Type Validation
- **Server-side validation** of MIME types before generating upload URLs
- **Strict allowlists** for each asset type:
  - **Covers**: `image/jpeg`, `image/png`, `image/webp`
  - **Models**: `model/gltf-binary`, `application/octet-stream`
  - **Pages**: `image/jpeg`, `image/png`, `image/webp`

### 2. File Size Enforcement
- **Pre-signed POST conditions** enforce size limits at S3 level
- **Configurable limits** per asset type:
  - **Covers**: 10MB max
  - **Models**: 100MB max
  - **Pages**: 5MB max

### 3. Object Validation
- **HEAD requests** validate object existence before saving keys to database
- **Metadata verification** including content-type, size, and ETag
- **Upload confirmation** required before marking assets as available

### 4. Server-side Key Generation
- **No user-controlled paths** - all S3 keys generated server-side
- **Consistent naming convention**: `{folder}/{book-id}.{ext}` or `pages/{book-id}/{page:04d}.{ext}`
- **Prevents path traversal** and unauthorized access

### 5. Admin-only Upload Permissions
- **IsAdminUser** permission required for all upload endpoints
- **JWT authentication** enforced
- **Role-based access control** via custom User model

## API Endpoints

### Upload Endpoints (Admin Only)
```
POST /api/books/{id}/assets/upload/cover/
POST /api/books/{id}/assets/upload/model/
POST /api/books/{id}/assets/upload/pages/
```

**Request Body:**
```json
{
  "content_type": "image/webp",
  "page_number": 1  // for pages only
}
```

**Response:**
```json
{
  "upload_data": {
    "url": "https://s3.amazonaws.com/bucket",
    "fields": { /* form fields */ }
  },
  "key": "covers/42.webp",
  "asset_type": "cover",
  "content_type": "image/webp",
  "max_size_mb": 10,
  "compression_recommended": true,
  "expires_in": 3600
}
```

### Confirmation Endpoint
```
POST /api/books/{id}/assets/confirm/
```

**Request Body:**
```json
{
  "asset_type": "cover",
  "object_key": "covers/42.webp"
}
```

**Validation Process:**
1. Validates object exists in S3 (HEAD request)
2. Retrieves and validates metadata
3. Checks content-type matches asset type
4. Updates book asset flags
5. Returns metadata confirmation

### Access Endpoints (Authenticated)
```
GET /api/books/{id}/assets/cover-url/
GET /api/books/{id}/assets/model-url/
GET /api/books/{id}/assets/page-url/{page_number}/
```

**Response:**
```json
{
  "signed_url": "https://s3.amazonaws.com/...",
  "expires_at": "2024-01-15T10:30:00Z",
  "content_type": "image/webp"
}
```

## S3 Bucket Configuration

### CORS Configuration
See `docs/s3-cors-config.json` for complete CORS setup.

### Bucket Policy (Recommended)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:user/3d-library-app"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:HeadObject"
      ],
      "Resource": [
        "arn:aws:s3:::3d-library-assets/covers/*",
        "arn:aws:s3:::3d-library-assets/models/*",
        "arn:aws:s3:::3d-library-assets/pages/*"
      ]
    }
  ]
}
```

## Compression Recommendations

### For 3D Models (GLB/GLTF)
- **Draco compression** for geometry (50-80% size reduction)
- **KTX2 textures** for optimal GPU loading
- **Binary format (GLB)** preferred over text GLTF

### For Images
- **WebP format** for covers (better compression than JPEG/PNG)
- **Progressive JPEG** for page textures
- **Appropriate quality settings** (80-90% for covers, 70-85% for pages)

### Implementation Notes
- Compression settings are **recommended** in API responses
- Frontend/admin tools should handle compression before upload
- Server validates final file sizes against limits

## Error Handling

### Upload Validation Errors
- **400 Bad Request**: Invalid content type, missing parameters
- **404 Not Found**: Object not found during confirmation
- **413 Payload Too Large**: File exceeds size limits (enforced by S3)
- **500 Internal Server Error**: S3 service errors

### Access Errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Asset not available or book not found

## Monitoring & Logging

### Logged Events
- Upload URL generation (with asset type and size)
- Object validation attempts and results
- Failed uploads and confirmations
- Asset deletion operations
- S3 service errors

### Metrics to Track
- Upload success/failure rates
- Asset confirmation delays
- Storage usage by asset type
- CDN cache hit rates (if implemented)

## Future Enhancements

### Public CDN Integration
- Move `covers/` to public CDN for faster loading
- Keep `models/` and `pages/` private with signed URLs
- Implement cache invalidation on asset updates

### Advanced Validation
- Image dimension validation
- 3D model polygon count limits
- Virus scanning integration
- Content moderation for uploaded images

### Performance Optimizations
- Thumbnail generation for covers
- Progressive model loading
- Texture streaming for large page collections
- Client-side compression before upload