import React from 'react';
import Book3DCard from './Book3DCard';

const Book3DCardDemo: React.FC = () => {
  // Sample book data for demonstration
  const sampleBooks = [
    {
      id: 1,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop',
      title: 'The Great Adventure',
      author: 'John Smith'
    },
    {
      id: 2,  
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      title: 'Mystery of the Lost City',
      author: 'Jane Doe'
    },
    {
      id: 3,
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop',
      title: 'Science Fiction Chronicles',
      author: 'Alex Johnson'
    },
    {
      id: 4,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop',
      title: 'Romance in Paris',
      author: 'Emily Brown'
    },
    {
      id: 5,
      coverImage: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=450&fit=crop',
      title: 'Cooking Masterclass',
      author: 'Chef Marco'
    },
    {
      id: 6,
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop',
      title: 'Digital Photography',
      author: 'Sarah Wilson'
    }
  ];

  const handleBookClick = (book: typeof sampleBooks[0]) => {
    alert(`Clicked on "${book.title}" by ${book.author}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pb-12" style={{paddingTop: '6rem'}}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            3D Book Card Component Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A realistic 3D book card component built with React and CSS transforms. 
            Hover over the books to see the interactive animations!
          </p>
        </div>

        {/* Books Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {sampleBooks.map((book) => (
            <Book3DCard
              key={book.id}
              coverImage={book.coverImage}
              title={book.title}
              author={book.author}
              onClick={() => handleBookClick(book)}
              className="transform transition-all duration-300 hover:scale-105"
            />
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default Book3DCardDemo;