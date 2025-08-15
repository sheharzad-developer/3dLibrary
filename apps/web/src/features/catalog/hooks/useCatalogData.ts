import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCatalog } from '../useCatalog';
import type { Book } from '../types';

// Mock data for demonstration - in a real app, this would come from an API
const mockBooks: Book[] = [
  // Harry Potter Series
  {
    id: '1',
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    isbn: '978-0-7475-3269-9',
    category: 'Fantasy',
    description: 'The first book in the magical Harry Potter series about a young wizard discovering his destiny.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    publishedYear: 1997,
    totalCopies: 8,
    availableCopies: 5,
    isAvailable: true,
  },
  {
    id: '2',
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    isbn: '978-0-7475-3849-3',
    category: 'Fantasy',
    description: 'Harry\'s second year at Hogwarts brings new mysteries and dangers.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    publishedYear: 1998,
    totalCopies: 6,
    availableCopies: 3,
    isAvailable: true,
  },
  {
    id: '3',
    title: 'Harry Potter and the Prisoner of Azkaban',
    author: 'J.K. Rowling',
    isbn: '978-0-7475-4215-5',
    category: 'Fantasy',
    description: 'Harry learns about his past and faces new threats in his third year.',
    coverUrl: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
    publishedYear: 1999,
    totalCopies: 7,
    availableCopies: 4,
    isAvailable: true,
  },
  
  // Computer Science & Programming
  {
    id: '4',
    title: 'Computer Architecture: A Quantitative Approach',
    author: 'John L. Hennessy & David A. Patterson',
    isbn: '978-0-12-383872-8',
    category: 'Computer Science',
    description: 'Comprehensive guide to modern computer architecture and design principles.',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    publishedYear: 2019,
    totalCopies: 4,
    availableCopies: 2,
    isAvailable: true,
  },
  {
    id: '5',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0-262-03384-8',
    category: 'Computer Science',
    description: 'The comprehensive guide to algorithms and data structures.',
    coverUrl: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=300&h=400&fit=crop',
    publishedYear: 2009,
    totalCopies: 6,
    availableCopies: 3,
    isAvailable: true,
  },
  {
    id: '6',
    title: 'Data Structures and Algorithms in Java',
    author: 'Robert Lafore',
    isbn: '978-0-672-32453-4',
    category: 'Computer Science',
    description: 'Learn fundamental data structures and algorithms with Java implementations.',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedYear: 2017,
    totalCopies: 5,
    availableCopies: 4,
    isAvailable: true,
  },
  {
    id: '7',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    category: 'Technology',
    description: 'A handbook of agile software craftsmanship.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    publishedYear: 2008,
    totalCopies: 8,
    availableCopies: 6,
    isAvailable: true,
  },
  
  // Horror Books
  {
    id: '8',
    title: 'The Shining',
    author: 'Stephen King',
    isbn: '978-0-385-12167-5',
    category: 'Horror',
    description: 'A psychological horror novel about isolation and madness at the Overlook Hotel.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    publishedYear: 1977,
    totalCopies: 5,
    availableCopies: 2,
    isAvailable: true,
  },
  {
    id: '9',
    title: 'Dracula',
    author: 'Bram Stoker',
    isbn: '978-0-486-41109-7',
    category: 'Horror',
    description: 'The classic vampire novel that defined the genre.',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    publishedYear: 1897,
    totalCopies: 4,
    availableCopies: 3,
    isAvailable: true,
  },
  {
    id: '10',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    isbn: '978-0-486-28211-4',
    category: 'Horror',
    description: 'The original science fiction horror novel about creating life.',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    publishedYear: 1818,
    totalCopies: 3,
    availableCopies: 1,
    isAvailable: true,
  },
  {
    id: '11',
    title: 'It',
    author: 'Stephen King',
    isbn: '978-0-670-81302-4',
    category: 'Horror',
    description: 'A terrifying tale of an ancient evil that haunts the town of Derry.',
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop',
    publishedYear: 1986,
    totalCopies: 6,
    availableCopies: 0,
    isAvailable: false,
  },
  
  // Classic Literature
  {
    id: '12',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    category: 'Fiction',
    description: 'A classic American novel set in the Jazz Age.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    publishedYear: 1925,
    totalCopies: 5,
    availableCopies: 3,
    isAvailable: true,
  },
  {
    id: '13',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    category: 'Fiction',
    description: 'A gripping tale of racial injustice and childhood innocence.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    publishedYear: 1960,
    totalCopies: 4,
    availableCopies: 2,
    isAvailable: true,
  },
  {
    id: '14',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    category: 'Fiction',
    description: 'A dystopian novel about totalitarianism and surveillance.',
    coverUrl: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
    publishedYear: 1949,
    totalCopies: 7,
    availableCopies: 5,
    isAvailable: true,
  },
  
  // Science Fiction
  {
    id: '15',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0-441-17271-9',
    category: 'Science Fiction',
    description: 'A science fiction epic set on the desert planet Arrakis.',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    publishedYear: 1965,
    totalCopies: 4,
    availableCopies: 2,
    isAvailable: true,
  },
  {
    id: '16',
    title: 'The Hitchhiker\'s Guide to the Galaxy',
    author: 'Douglas Adams',
    isbn: '978-0-345-39180-3',
    category: 'Science Fiction',
    description: 'A comedic science fiction series about space travel and the meaning of life.',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
    publishedYear: 1979,
    totalCopies: 6,
    availableCopies: 4,
    isAvailable: true,
  },
  
  // Fantasy
  {
    id: '17',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    isbn: '978-0-547-92822-7',
    category: 'Fantasy',
    description: 'The first volume of the epic fantasy trilogy.',
    coverUrl: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
    publishedYear: 1954,
    totalCopies: 8,
    availableCopies: 5,
    isAvailable: true,
  },
  {
    id: '18',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0-547-92822-7',
    category: 'Fantasy',
    description: 'A fantasy adventure novel that precedes The Lord of the Rings.',
    coverUrl: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
    publishedYear: 1937,
    totalCopies: 8,
    availableCopies: 6,
    isAvailable: true,
  },
  
  // Business & Self-Help
  {
    id: '19',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '978-0-307-88789-4',
    category: 'Business',
    description: 'How constant innovation creates radically successful businesses.',
    coverUrl: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=300&h=400&fit=crop',
    publishedYear: 2011,
    totalCopies: 6,
    availableCopies: 3,
    isAvailable: true,
  },
  {
    id: '20',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '978-0-7352-1129-2',
    category: 'Self-Help',
    description: 'An easy and proven way to build good habits and break bad ones.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    publishedYear: 2018,
    totalCopies: 10,
    availableCopies: 7,
    isAvailable: true,
  },
  
  // History & Biography
  {
    id: '21',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    category: 'History',
    description: 'A brief history of humankind.',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedYear: 2011,
    totalCopies: 6,
    availableCopies: 4,
    isAvailable: true,
  },
  {
    id: '22',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    isbn: '978-1-4516-4853-9',
    category: 'Biography',
    description: 'The exclusive biography of Steve Jobs.',
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop',
    publishedYear: 2011,
    totalCopies: 5,
    availableCopies: 2,
    isAvailable: true,
  },
  
  // Romance
  {
    id: '23',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0-14-143951-8',
    category: 'Romance',
    description: 'A romantic novel of manners.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    publishedYear: 1813,
    totalCopies: 4,
    availableCopies: 2,
    isAvailable: true,
  },
  {
    id: '24',
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    isbn: '978-0-446-60523-4',
    category: 'Romance',
    description: 'A touching love story that spans decades.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    publishedYear: 1996,
    totalCopies: 5,
    availableCopies: 3,
    isAvailable: true,
  },
];

interface CatalogQueryParams {
  searchQuery: string;
  category: string;
  author: string;
  availability: 'all' | 'available' | 'unavailable';
  publishedYearMin?: number;
  publishedYearMax?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface CatalogResponse {
  books: Book[];
  total: number;
  totalPages: number;
}

// Simulate API call with filtering, sorting, and pagination
const fetchCatalogData = async (params: CatalogQueryParams): Promise<CatalogResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filteredBooks = [...mockBooks];

  // Apply search filter
  if (params.searchQuery) {
    const query = params.searchQuery.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.isbn.includes(query)
    );
  }

  // Apply category filter
  if (params.category) {
    filteredBooks = filteredBooks.filter(book => book.category === params.category);
  }

  // Apply author filter
  if (params.author) {
    const authorQuery = params.author.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(authorQuery)
    );
  }

  // Apply availability filter
  if (params.availability !== 'all') {
    filteredBooks = filteredBooks.filter(book => 
      params.availability === 'available' ? book.isAvailable : !book.isAvailable
    );
  }

  // Apply year range filter
  if (params.publishedYearMin) {
    filteredBooks = filteredBooks.filter(book => book.publishedYear >= params.publishedYearMin!);
  }
  if (params.publishedYearMax) {
    filteredBooks = filteredBooks.filter(book => book.publishedYear <= params.publishedYearMax!);
  }

  // Apply sorting
  filteredBooks.sort((a, b) => {
    let aValue: string | number = a[params.sortBy as keyof Book] as string | number;
    let bValue: string | number = b[params.sortBy as keyof Book] as string | number;

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) {
      return params.sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return params.sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const total = filteredBooks.length;
  const totalPages = Math.ceil(total / params.pageSize);
  
  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const endIndex = startIndex + params.pageSize;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  return {
    books: paginatedBooks,
    total,
    totalPages,
  };
};

export function useCatalogData() {
  const {
    searchQuery,
    filters,
    pagination,
    sortBy,
    sortOrder,
    setLoading,
    setError,
    setPagination,
  } = useCatalog();

  const queryParams: CatalogQueryParams = {
    searchQuery,
    category: filters.category,
    author: filters.author,
    availability: filters.availability,
    publishedYearMin: filters.publishedYear?.min,
    publishedYearMax: filters.publishedYear?.max,
    sortBy,
    sortOrder,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['catalog', queryParams],
    queryFn: () => fetchCatalogData(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update catalog state when data changes
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setError(error ? error.message : null);
  }, [error, setError]);

  useEffect(() => {
    if (data) {
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      });
    }
  }, [data, setPagination]);

  return {
    books: data?.books || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
  };
}