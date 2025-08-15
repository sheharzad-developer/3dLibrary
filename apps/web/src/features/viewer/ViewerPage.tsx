import React from 'react';
import BookViewerPage from './components/BookViewerPage';

// Re-export the new BookViewerPage component
const ViewerPage: React.FC = () => {
  return <BookViewerPage />;
};

export default ViewerPage;