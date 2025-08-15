import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useModelPreloader } from './hooks/useModelPreloader';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { schedulePreload, cancelPreload } = useModelPreloader();

  // Mock book data
  const mockBook = {
    id: id || '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    publication_date: '1925-04-10',
    pages: 180,
    language: 'English',
    genre: 'Fiction',
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on prosperous Long Island and in New York City, the novel tells the story of Jay Gatsby and his obsession with Daisy Buchanan.',
    cover_image: null,
    available_copies: 3,
    total_copies: 5
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              to="/catalog"
              className="text-blue-600 hover:text-blue-800 font-medium mr-4"
            >
              ← Back to Catalog
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Book Details</h1>
          </div>
        </div>
      </div>

      {/* Book Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <div className="h-64 w-48 bg-gray-200 rounded-lg flex items-center justify-center">
                {mockBook.cover_image ? (
                  <img
                    src={mockBook.cover_image}
                    alt={mockBook.title}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-6xl mb-2">📚</div>
                    <div className="text-sm">No Cover</div>
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{mockBook.title}</h2>
              <p className="text-xl text-gray-600 mb-4">by {mockBook.author}</p>
              <p className="text-gray-700 mb-6">{mockBook.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="font-medium text-gray-500">ISBN:</span>
                  <span className="ml-2 text-gray-900">{mockBook.isbn}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Publication Date:</span>
                  <span className="ml-2 text-gray-900">{new Date(mockBook.publication_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Pages:</span>
                  <span className="ml-2 text-gray-900">{mockBook.pages}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Language:</span>
                  <span className="ml-2 text-gray-900">{mockBook.language}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Genre:</span>
                  <span className="ml-2 text-gray-900">{mockBook.genre}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Available:</span>
                  <span className="ml-2 text-gray-900">{mockBook.available_copies} of {mockBook.total_copies}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                  Borrow Book
                </button>
                <Link
                  to={`/books/${mockBook.id}/viewer`}
                  state={{ bookTitle: mockBook.title }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  onMouseEnter={() => schedulePreload(mockBook.id, 200)}
                  onMouseLeave={() => cancelPreload(mockBook.id)}
                >
                  View in 3D
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;