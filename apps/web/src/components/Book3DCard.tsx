import React from 'react';
import './Book3DCard.css';

interface Book3DCardProps {
  coverImage: string;
  title?: string;
  author?: string;
  className?: string;
  onClick?: () => void;
}

const Book3DCard: React.FC<Book3DCardProps> = ({
  coverImage,
  title,
  author,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`book-3d-container ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="book-3d">
        {/* Book spine */}
        <div className="book-spine" />
        
        {/* Book pages edge */}
        <div className="book-pages" />
        
        {/* Book front cover */}
        <div className="book-cover">
          <img 
            src={coverImage} 
            alt={title || 'Book cover'}
            className="cover-image"
            loading="lazy"
          />
          
          {/* Optional overlay for better text readability */}
          {(title || author) && (
            <div className="book-info">
              {title && <h3 className="book-title">{title}</h3>}
              {author && <p className="book-author">{author}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book3DCard;